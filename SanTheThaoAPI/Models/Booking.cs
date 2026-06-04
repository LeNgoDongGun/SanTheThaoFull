namespace SanTheThaoAPI.Models;

public class Booking
{
    public int Id { get; set; }
    public int CourtId { get; set; }
    public int UserId { get; set; }
    public DateOnly BookingDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public decimal TotalPrice { get; set; }
    public int Status { get; set; } // 0=Pending, 1=Confirmed, 2=Cancelled
    public string? Note { get; set; }
    public DateTime CreatedAt { get; set; }
    public Court? Court { get; set; }
    public User? User { get; set; }
}