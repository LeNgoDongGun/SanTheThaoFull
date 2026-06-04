namespace SanTheThaoAPI.Models;

public class Court
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public decimal PricePerHour { get; set; }
    public bool IsActive { get; set; }
    public int SportTypeId { get; set; }
    public string? ImageUrl { get; set; }
    public SportType? SportType { get; set; }
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}