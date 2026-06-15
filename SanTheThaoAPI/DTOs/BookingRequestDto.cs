namespace SanTheThaoAPI.DTOs;

public class BookingRequestDto
{
    public int CourtId { get; set; }
    public string Date { get; set; } = string.Empty;   // Định dạng: YYYY-MM-DD
    public string Start { get; set; } = string.Empty;  // Định dạng: HH:mm
    public string End { get; set; } = string.Empty;    // Định dạng: HH:mm
    public string? Note { get; set; }
    public string PaymentMethod { get; set; } = "Cash"; // "Cash" hoặc "Momo"
}