using HackerRankFeedApi.Models;

namespace HackerRankFeedApi.Services;

public interface IHnNewsService
{
    Task<HnStoryResponse?> GetStory(int id);
    Task<IEnumerable<HnStoryResponse?>> GetStoriesWithDetails(string type, long lastId, int pageSize);
}