using HackerRankFeedApi.Entities;
using HackerRankFeedApi.Models;

namespace HackerRankFeedApi.Mappers;

public static class HnStoryMapper
{
    public static HnStory ToHnStory(this HnStoryResponse hnStoryResponse)
    {
        return new HnStory
        {
            Id = hnStoryResponse.Id,
            Title = hnStoryResponse.Title,
            Url = hnStoryResponse.Url,
            Score = hnStoryResponse.Score,
            By = hnStoryResponse.By,
            Time = hnStoryResponse.Time,
            Type = hnStoryResponse.Type
        };
    }
    public static HnStoryResponse? ToHnStoryResponse(this HnStory? hnStory)
    {
        if (hnStory == null)
            return null;
        return new HnStoryResponse
        {
            Id = hnStory.Id,
            Title = hnStory.Title,
            Url = hnStory.Url,
            Score = hnStory.Score,
            By = hnStory.By,
            Time = hnStory.Time,
            Type = hnStory.Type
        };
    }
}