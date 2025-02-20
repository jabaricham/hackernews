using HackerRankFeedApi.Services;
using Microsoft.AspNetCore.Mvc;

namespace HackerRankFeedApi.Controllers;

[ApiController]
[Route("hackernews")]
public class HnFeedController : ControllerBase
{
    private readonly IHnNewsService _hnNewsService;

    public HnFeedController(IHnNewsService hnNewsService)
    {
        _hnNewsService = hnNewsService;
    }

    // GET
    [HttpGet("{storyType}")]
    public async Task<IActionResult> Index(string storyType, [FromQuery] long lastId = 0, [FromQuery] int pageSize = 20)
    {
        if (!IsValidStoryType(storyType))
        {
            return BadRequest("Invalid story type");
        }

        var stories = await _hnNewsService.GetStoriesWithDetails(storyType, lastId, pageSize);
        return Ok(stories);
    }

    [HttpGet("story/{id}")]
    public async Task<IActionResult> Story(int id)
    {
        var story = await _hnNewsService.GetStory(id);
        return Ok(story);
    }

    private bool IsValidStoryType(string storyType)
    {
        return new[] { "beststories", "topstories", "newstories", "askstories", "showstories", "jobstories" }.Contains(
            storyType.ToLower());
    }
}