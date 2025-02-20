using Flurl.Http;
using Flurl.Http.Configuration;
using Flurl.Http.Testing;
using HackerRankFeedApi.Entities;
using HackerRankFeedApi.Models;
using HackerRankFeedApi.Repositories;
using HackerRankFeedApi.Services;
using Microsoft.Extensions.Logging;
using Moq;

namespace HackerRankFeedApiTests;

public class HnNewsServiceTests
{
    private IHnNewsService _hnNewsService;
    private Mock<IHnNewsRepository> _mockHnNewsRepository;

    
    public HnNewsServiceTests()
    {
        var mockLogger = new Mock<ILogger<HnNewsService>>();
        _mockHnNewsRepository = new Mock<IHnNewsRepository>();
        var clientCache = new FlurlClientCache().Add("HnApi", "https://hacker-news.firebaseio.com/v0");
        _hnNewsService =
            new HnNewsService(clientCache, _mockHnNewsRepository.Object, mockLogger.Object);
    }


    [Fact]
    public async Task GetStory_ValidId_ReturnsStory()
    {
        // Arrange
        var id = 123;
        var storyResponse = new HnStoryResponse { Id = id, Title = "Test Story" };
        using var httpTest = new HttpTest();
        httpTest.ForCallsTo($"https://hacker-news.firebaseio.com/v0/item/{id}.json")
            .RespondWithJson(storyResponse);
        _mockHnNewsRepository
            .Setup(c => c.GetStoryById(It.IsAny<int>()))
            .ReturnsAsync(new HnStory());
        // Act
        var story = await _hnNewsService.GetStory(id);

        // Assert
        Assert.NotNull(story);
        Assert.Equal(id, story.Id);
        Assert.Equal("Test Story", story.Title);
    }

    [Fact]
    public async Task GetStory_InvalidId_ReturnsNull()
    {
        // Arrange
        var id = 0; // Invalid id
        using var httpTest = new HttpTest();
        httpTest.ForCallsTo($"https://hacker-news.firebaseio.com/v0/item/{id}.json")
            .RespondWithJson(null); // Return null for invalid id
        _mockHnNewsRepository
            .Setup(c => c.GetStoryById(It.IsAny<int>()))
            .ReturnsAsync((HnStory?)null); // Return null for invalid id

        // Act
        var story = await _hnNewsService.GetStory(id);

        // Assert
        Assert.Null(story);
    }

    [Fact]
    public async Task GetStoriesWithDetails_ValidTypeAndPageSize_ReturnsStories()
    {
        // Arrange
        var type = "topstories";
        var pageSize = 10;
        var lastId = 0;
        var storyIds = new int[] { 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 };
        var storyResponses = storyIds.Select(id => new HnStory { Id = id, Title = $"Story {id}" }).ToList();

        using var httpTest = new HttpTest();
        httpTest.ForCallsTo($"https://hacker-news.firebaseio.com/v0/{type}.json")
            .RespondWithJson(storyIds);

        foreach (var id in storyIds)
        {
            httpTest.ForCallsTo($"https://hacker-news.firebaseio.com/v0/item/{id}.json")
                .RespondWithJson(storyResponses.First(s => s.Id == id));
        }

        _mockHnNewsRepository
            .Setup(r => r.BulkInsertOrUpdate(It.IsAny<IEnumerable<HnStory>>()))
            .Returns(Task.CompletedTask);

        _mockHnNewsRepository
            .Setup(r => r.GetNextStories(lastId, pageSize))
            .Returns(storyResponses);

        // Act
        var stories = await _hnNewsService.GetStoriesWithDetails(type, lastId, pageSize);

        // Assert
        Assert.NotNull(stories);
        Assert.Equal(pageSize, stories.Count());
        Assert.All(stories, s => Assert.Contains(s.Id, storyIds));
        Assert.All(stories, s => Assert.StartsWith("Story ", s.Title));
    }

    [Fact]
    public async Task GetStoriesWithDetails_InvalidType_ReturnsEmptyList()
    {
        // Arrange
        var type = "invalid";
        var pageSize = 10;
        var lastId = 0;

        using var httpTest = new HttpTest();
        httpTest.ForCallsTo($"https://hacker-news.firebaseio.com/v0/{type}.json")
            .RespondWithJson(new {
                Error = "Permission denied"
            }, 403); // Return null for invalid type

        _mockHnNewsRepository
            .Setup(r => r.GetNextStories(lastId, pageSize))
            .Returns(new List<HnStory>()); // Return an empty list for invalid type

        // Act & Assert
        await Assert.ThrowsAsync<FlurlHttpException>(async () => await _hnNewsService.GetStoriesWithDetails(type, lastId, pageSize));
    }

    [Fact]
    public async Task GetStoriesWithDetails_PageSizeLessThanOne_ReturnsEmptyList()
    {
        // Arrange
        var type = "topstories";
        var pageSize = 0;
        var lastId = 0;
        
        // Act
        var stories = await _hnNewsService.GetStoriesWithDetails(type, lastId, pageSize);

        // Assert
        Assert.NotNull(stories);
        Assert.Equal(pageSize, stories.Count());
    }
}