using System.Diagnostics;
using Flurl.Http;
using Flurl.Http.Configuration;
using HackerRankFeedApi.Entities;
using HackerRankFeedApi.Mappers;
using HackerRankFeedApi.Models;
using HackerRankFeedApi.Repositories;

namespace HackerRankFeedApi.Services;

public class HnNewsService : IHnNewsService
{
    private readonly IFlurlClient _flurlClient;
    private readonly IHnNewsRepository _hnNewsRepository;
    private readonly ILogger<HnNewsService> _logger;

    /// <summary>
    /// Constructor for <see cref="HnNewsService"/>.
    /// </summary>
    /// <param name="clients">The <see cref="IFlurlClientCache"/> instance that provides
    /// the <see cref="IFlurlClient"/> for the Hacker News API.</param>
    /// <param name="hnNewsRepository">HnNewsRepository</param>
    /// <param name="logger">The <see cref="ILogger{TCategoryName}"/> instance that is used
    /// to log messages.</param>
    public HnNewsService(IFlurlClientCache clients, IHnNewsRepository hnNewsRepository, ILogger<HnNewsService> logger)
    {
        _hnNewsRepository = hnNewsRepository;
        _logger = logger;
        _flurlClient = clients.Get("HnApi");
    }

    /// <summary>
    /// Gets the story with the specified <paramref name="id"/>.
    /// If the story is already in the database and not older than 30 seconds, it is returned from the database.
    /// Otherwise, it is fetched from the Hacker News API, saved to the database and returned.
    /// </summary>
    /// <param name="id">The id of the story to get.</param>
    /// <returns>The story with the specified <paramref name="id"/>.</returns>
    public async Task<HnStoryResponse?> GetStory(int id)
    {
        var story = await _hnNewsRepository.GetStoryById(id);
        // Check if story is already in the database and not older than 30 seconds
        if (story != null && DateTimeOffset.FromUnixTimeMilliseconds(story.Time) > DateTimeOffset.Now.AddSeconds(-30))
        {
            return story.ToHnStoryResponse();
        }

        var result = await _flurlClient.Request($"item/{id}.json")
            .GetJsonAsync<HnStory>();
        //Attach the story to the database and save changes
        await _hnNewsRepository.Update(result);
        return result.ToHnStoryResponse();
    }

    /// <summary>
    /// Retrieves all stories with details.
    /// </summary>
    /// <param name="type">The type of stories to retrieve.
    ///     Valid values are "beststories", "topstories", "newstories", "askstories", "showstories", "jobstories".
    /// </param>
    /// <param name="lastId">The last id of the stories to retrieve.
    ///     If no value is provided, all stories are retrieved.
    /// </param>
    /// <param name="pageSize">The number of stories to retrieve.</param>
    /// <returns>A list of all stories with details.</returns>
    public async Task<IEnumerable<HnStoryResponse?>> GetStoriesWithDetails(string type, long lastId, int pageSize)
    {
        if (pageSize < 1)
        {
            return [];
        }
        var stopWatch = new Stopwatch();
        stopWatch.Start();
        var storyIds = await GetStoryIdsFromApi(type);
        var result = await Task.WhenAll(storyIds.Select(FetchStoryFromApi));
        stopWatch.Stop();
        _logger.LogInformation("Time taken to fetch {0} stories: {1}ms", type, stopWatch.ElapsedMilliseconds);
        await _hnNewsRepository.BulkInsertOrUpdate(result);
        var stories = _hnNewsRepository.GetNextStories(lastId, pageSize);
        return stories.Select(c => c.ToHnStoryResponse());
    }
    private async Task<IEnumerable<long>> GetStoryIdsFromApi(string type)
    {
        return await _flurlClient.Request($"{type}.json")
            .GetJsonAsync<IEnumerable<long>>();
    }

    private async Task<HnStory> FetchStoryFromApi(long id)
    {
        return await _flurlClient.Request($"item/{id}.json")
            .GetJsonAsync<HnStory>();
    }
}