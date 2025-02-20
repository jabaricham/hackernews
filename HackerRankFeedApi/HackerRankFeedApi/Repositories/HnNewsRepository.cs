using EFCore.BulkExtensions;
using HackerRankFeedApi.Entities;
using HackerRankFeedApi.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace HackerRankFeedApi.Repositories;

public class HnNewsRepository : IHnNewsRepository
{
    private readonly HnDbContext _dbContext;

    public HnNewsRepository(HnDbContext dbContext)
    {
        _dbContext = dbContext;
    }
    public async Task Update(HnStory story)
    {
        await  _dbContext.Stories
            .Where(c => c.Id == story.Id)
            .ExecuteUpdateAsync(c => c.SetProperty(x=>x.Id, story.Id)
                .SetProperty(x => x.By, story.By)
                .SetProperty(x => x.Descendants, story.Descendants)
                .SetProperty(x => x.Kids, story.Kids)
                .SetProperty(x => x.Score, story.Score)
                .SetProperty(x => x.Time, story.Time)
                .SetProperty(x => x.Title, story.Title)
                .SetProperty(x => x.Url, story.Url)
                .SetProperty(x => x.Type, story.Type));
    }

    public async Task<HnStory?> GetStoryById(int id)
    {
        return await _dbContext.Stories.FirstOrDefaultAsync(c => c.Id == id);
    }

    public async Task BulkInsertOrUpdate(IEnumerable<HnStory> stories)
    {
        await _dbContext.BulkInsertOrUpdateAsync(stories);
    }

    public IEnumerable<HnStory?> GetNextStories(long lastId, int pageSize)
    {
        return _dbContext
            .Stories
            .Where(c => c.Id > lastId)
            .OrderBy(c => c.Id)
            .Take(pageSize);
    }
}

public interface IHnNewsRepository
{
    public Task Update(HnStory story);
    public Task<HnStory?> GetStoryById(int id);
    public Task BulkInsertOrUpdate(IEnumerable<HnStory> stories);
    public IEnumerable<HnStory?> GetNextStories(long lastId, int pageSize);
}