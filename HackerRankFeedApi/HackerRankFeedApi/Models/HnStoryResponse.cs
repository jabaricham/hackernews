namespace HackerRankFeedApi.Models;

public record HnStoryResponse
{
    public string By { get; set; } = string.Empty;
    public int Descendants { get; set; }
    public int Id { get; set; }
    public IEnumerable<int> Kids { get; set; } = new List<int>();
    public int Score { get; set; }
    public long Time { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Url { get; set; } = string.Empty;
}