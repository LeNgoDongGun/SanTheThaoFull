namespace SanTheThaoAPI.Models;

public class NewsPost
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string Slug { get; set; } = "";
    public string Summary { get; set; } = "";
    public string Content { get; set; } = "";
    public string? ThumbnailUrl { get; set; }
    public string Category { get; set; } = "";
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public int AuthorId { get; set; }
    public User? Author { get; set; }
}