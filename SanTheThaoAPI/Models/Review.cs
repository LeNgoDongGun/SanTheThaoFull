namespace SanTheThaoAPI.Models;

public class Review
{
    public int Id { get; set; }
    public int CourtId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = "";
    public string? UserName { get; set; }
    public Court? Court { get; set; }
}