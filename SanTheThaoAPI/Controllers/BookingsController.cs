using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanTheThaoAPI.Models;

namespace SanTheThaoAPI.Controllers;

// Chuẩn hóa duy nhất 1 DTO dùng String để hứng dữ liệu JSON cực khớp với Angular
public class BookingRequestDto
{
    public int CourtId { get; set; }
    public int UserId { get; set; } 
    public string BookingDate { get; set; } = string.Empty; // Nhận chuỗi "YYYY-MM-DD"
    public string StartTime { get; set; } = string.Empty;   // Nhận chuỗi "HH:mm"
    public string EndTime { get; set; } = string.Empty;     // Nhận chuỗi "HH:mm"
    public string? Note { get; set; }
    public string PaymentMethod { get; set; } = "Cash"; 
}

[ApiController]
[Route("api/[controller]")]
public class BookingsController : ControllerBase
{
    private readonly SanTheThaoContext _context;
    private readonly IHttpClientFactory _httpClientFactory;

    public BookingsController(SanTheThaoContext context, IHttpClientFactory httpClientFactory)
    {
        _context = context;
        _httpClientFactory = httpClientFactory;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Booking>>> GetAll()
        => await _context.Bookings.Include(b => b.Court).ToListAsync();

    [HttpPost("create")]
    public async Task<ActionResult> Create([FromBody] BookingRequestDto request)
    {
        var court = await _context.Courts.FindAsync(request.CourtId);
        if (court == null)
            return NotFound(new { success = false, message = "Không tìm thấy sân bóng." });

        // Logic tính tiền tự động dựa trên khoảng thời gian đặt
        decimal totalPrice = court.PricePerHour;
        try 
        {
            var start = TimeOnly.Parse(request.StartTime);
            var end = TimeOnly.Parse(request.EndTime);
            var duration = (end - start).TotalHours;
            if (duration > 0) {
                totalPrice = (decimal)duration * court.PricePerHour;
            }
        }
        catch { /* Fallback về giá 1 giờ nếu lỗi parse */ }

        // Tạo bản ghi Booking chuẩn chỉnh
        var booking = new Booking
        {
            CourtId = request.CourtId,
            UserId = request.UserId, 
            BookingDate = DateOnly.Parse(request.BookingDate),
            StartTime = TimeOnly.Parse(request.StartTime),
            EndTime = TimeOnly.Parse(request.EndTime),
            TotalPrice = totalPrice, // 👈 ĐÃ SỬA: Gán tiền đầy đủ, không để bằng 0đ nữa
            Note = request.Note,
            CreatedAt = DateTime.Now,
            Status = 0 
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        if (request.PaymentMethod != "Momo")
        {
            return Ok(new { success = true, bookingId = booking.Id, paymentMethod = "Cash", message = "Đặt sân bằng tiền mặt thành công!" });
        }

        // Luồng MoMo giữ nguyên...
        try
        {
            string endpoint    = "https://test-payment.momo.vn/v2/gateway/api/create"; 
            string partnerCode = "MOMO"; 
            string accessKey   = "F8BBA842ECF85"; 
            string secretKey   = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
            
            string redirectUrl = "http://localhost:4200/booking-result"; 
            string ipnUrl      = "http://localhost:5135/api/bookings/momocallback"; 
            string requestType = "captureWallet"; 

            string randomGuid  = Guid.NewGuid().ToString().Replace("-", "").Substring(0, 10);
            string orderId     = "BILL" + booking.Id + "X" + randomGuid;
            string requestId   = Guid.NewGuid().ToString().Replace("-", ""); 
            
            string orderInfo   = "Thanh toan dat san " + booking.Id; 
            string amount      = ((long)totalPrice).ToString(); 
            string extraData   = ""; 

            string rawData = $"accessKey={accessKey}&amount={amount}&extraData={extraData}&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={redirectUrl}&requestId={requestId}&requestType={requestType}";
            string signature = CreateSignature(rawData, secretKey);

            var requestData = new { partnerCode, accessKey, requestId, amount, orderId, orderInfo, redirectUrl, ipnUrl, lang = "vi", extraData, requestType, signature };

            var client = _httpClientFactory.CreateClient();
            var response = await client.PostAsJsonAsync(endpoint, requestData);
            var rawResponse = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                using var doc = JsonDocument.Parse(rawResponse);
                var root = doc.RootElement;
                if (root.TryGetProperty("resultCode", out var resultCodeProp) && resultCodeProp.GetInt32() == 0)
                {
                    if (root.TryGetProperty("payUrl", out var payUrlProp))
                    {
                        return Ok(new { success = true, paymentMethod = "Momo", payUrl = payUrlProp.GetString() });
                    }
                }
            }

            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();
            return StatusCode(500, new { success = false, message = "Cổng MoMo từ chối giao dịch." });
        }
        catch (Exception ex)
        {
            _context.Bookings.Remove(booking);
            await _context.SaveChangesAsync();
            return StatusCode(500, new { success = false, message = "Lỗi kết nối MoMo: " + ex.Message });
        }
    }

    private static string CreateSignature(string rawData, string secretKey)
    {
        var keyBytes = Encoding.UTF8.GetBytes(secretKey);
        var messageBytes = Encoding.UTF8.GetBytes(rawData);
        using var hmac = new HMACSHA256(keyBytes);
        var hashBytes = hmac.ComputeHash(messageBytes);
        var sb = new StringBuilder();
        foreach (var b in hashBytes) sb.Append(b.ToString("x2"));
        return sb.ToString();
    }
}