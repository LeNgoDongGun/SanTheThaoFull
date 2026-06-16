using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SanTheThaoAPI.Models;

namespace SanTheThaoAPI.Controllers;

// Giữ nguyên DTO của ông để hứng dữ liệu chuẩn từ Angular gửi lên
public class BookingRequestDto
{
    public int CourtId { get; set; }
    public int UserId { get; set; } 
    public string BookingDate { get; set; } = string.Empty; 
    public string StartTime { get; set; } = string.Empty;   
    public string EndTime { get; set; } = string.Empty;     
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

    [HttpGet("{id}")]
    public async Task<ActionResult<Booking>> GetById(int id)
    {
        var item = await _context.Bookings.Include(b => b.Court).FirstOrDefaultAsync(b => b.Id == id);
        return item == null ? NotFound() : item;
    }

    [HttpPost("create")]
    public async Task<ActionResult> Create([FromBody] BookingRequestDto request)
    {
        // 1. Kiểm tra trùng lịch (Đã dọn từ đống conflict đưa lên đúng vị trí)
        var start = TimeOnly.Parse(request.StartTime);
        var end = TimeOnly.Parse(request.EndTime);
        var bDate = DateOnly.Parse(request.BookingDate);

        var trung = await _context.Bookings.AnyAsync(b =>
            b.CourtId == request.CourtId &&
            b.BookingDate == bDate &&
            b.Status != 2 &&
            b.StartTime < end &&
            b.EndTime > start
        );

        if (trung)
            return BadRequest(new { success = false, message = "Sân đã được đặt trong khung giờ này!" });

        var court = await _context.Courts.FindAsync(request.CourtId);
        if (court == null)
            return NotFound(new { success = false, message = "Không tìm thấy sân bóng." });

        // Tự động tính tiền dựa trên thời gian
        decimal totalPrice = court.PricePerHour;
        var duration = (end - start).TotalHours;
        if (duration > 0) {
            totalPrice = (decimal)duration * court.PricePerHour;
        }

        // 2. Tạo bản ghi Booking lưu xuống Database
        var booking = new Booking
        {
            CourtId = request.CourtId,
            UserId = request.UserId, 
            BookingDate = bDate,
            StartTime = start,
            EndTime = end,
            TotalPrice = totalPrice, 
            Note = request.Note,
            CreatedAt = DateTime.Now,
            Status = 0 
        };

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();

        // Nếu trả tiền mặt thì báo thành công luôn
        if (request.PaymentMethod != "Momo")
        {
            return Ok(new { success = true, bookingId = booking.Id, paymentMethod = "Cash", message = "Đặt sân bằng tiền mặt thành công!" });
        }

        // 3. Luồng gọi cổng MoMo Sandbox (Được tối ưu đọc trực tiếp kết quả, không cần tạo thêm DTO nhận)
        try
        {
            string endpoint    = "https://test-payment.momo.vn/v2/gateway/api/create"; 
            string partnerCode = "MOMO"; 
            string accessKey   = "F8BBA842ECF85"; 
            string secretKey   = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
            
            string redirectUrl = "http://localhost:4200/booking-result"; 
            string ipnUrl      = "http://localhost:5135/api/bookings/momocallback"; 
            string requestType = "captureWallet"; 

            string randomGuid  = Guid.NewGuid().ToString().Replace("-", "")[..10];
            string orderId     = "BILL" + booking.Id + "X" + randomGuid;
            string requestId   = Guid.NewGuid().ToString().Replace("-", ""); 
            
            string orderInfo   = "Thanh toan dat san " + booking.Id; 
            string amount      = ((long)totalPrice).ToString(); 
            string extraData   = ""; 

            string rawData = $"accessKey={accessKey}&amount={amount}&extraData={extraData}&ipnUrl={ipnUrl}&orderId={orderId}&orderInfo={orderInfo}&partnerCode={partnerCode}&redirectUrl={redirectUrl}&requestId={requestId}&requestType={requestType}";
            string signature = CreateSignature(rawData, secretKey);

            // Dùng Anonymous Type làm object gửi đi gọn nhẹ
            var requestData = new { partnerCode, accessKey, requestId, amount, orderId, orderInfo, redirectUrl, ipnUrl, lang = "vi", extraData, requestType, signature };

            var client = _httpClientFactory.CreateClient();
            var response = await client.PostAsJsonAsync(endpoint, requestData);
            
            if (response.IsSuccessStatusCode)
            {
                // Tối ưu bóc tách link payUrl trực tiếp qua JsonElement không cần DTO Response
                var root = await response.Content.ReadFromJsonAsync<JsonElement>();
                if (root.GetProperty("resultCode").GetInt32() == 0)
                {
                    return Ok(new { success = true, paymentMethod = "Momo", payUrl = root.GetProperty("payUrl").GetString() });
                }
            }

            // Hoàn tác nếu lỗi cổng thanh toán
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

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Booking item)
    {
        if (id != item.Id) return BadRequest();
        _context.Entry(item).State = EntityState.Modified;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var item = await _context.Bookings.FindAsync(id);
        if (item == null) return NotFound();
        _context.Bookings.Remove(item);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    private static string CreateSignature(string rawData, string secretKey)
    {
        var keyBytes = Encoding.UTF8.GetBytes(secretKey);
        using var hmac = new HMACSHA256(keyBytes);
        var hashBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(rawData));
        return Convert.ToHexString(hashBytes).ToLower();
    }
}