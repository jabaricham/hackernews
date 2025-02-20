namespace HackerRankFeedApi.Entities;

public class HnStory
{
    public int Id { get; set; }
    public string? By { get; set; }
    public int Descendants { get; set; }
    public IEnumerable<int> Kids { get; set; } = new List<int>();
    public int Score { get; set; }
    public long Time { get; set; }
    public string? Title { get; set; }
    public string? Type { get; set; }
    public string? Url { get; set; }
}