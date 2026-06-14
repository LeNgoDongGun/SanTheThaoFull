using System.Text;
using System.Text.Json;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore; // Thêm để dùng Include lấy dữ liệu liên kết
using SanTheThaoAPI.Models; // Khai báo để sử dụng SanTheThaoContext

namespace SanTheThaoAPI.Controllers;

public class ChatRequestDto
{
    public string Prompt { get; set; } = string.Empty;
}

[ApiController]
[Route("api/[controller]")]
public class chatbotController : ControllerBase
{
    private readonly IConfiguration _configuration;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly SanTheThaoContext _context; // 1. Khai báo đúng Context của bạn

    // 2. Inject SanTheThaoContext vào Constructor
    public chatbotController(
        IConfiguration configuration, 
        IHttpClientFactory httpClientFactory, 
        SanTheThaoContext context)
    {
        _configuration = configuration;
        _httpClientFactory = httpClientFactory;
        _context = context;
    }

    [HttpPost("chat")]
    public async Task<IActionResult> AskLlama([FromBody] ChatRequestDto request)
    {
        if (string.IsNullOrEmpty(request.Prompt))
            return BadRequest(new { success = false, message = "Nội dung câu hỏi không được để trống." });

        var apiKey = _configuration["Groq:ApiKey"] ?? "";
        const string apiUrl = "https://api.groq.com/openai/v1/chat/completions";

        if (string.IsNullOrEmpty(apiKey))
            return StatusCode(500, new { success = false, message = "Chưa tìm thấy Groq ApiKey trong appsettings.json." });

        try
        {
            // 3. TRUY VẤN DỮ LIỆU TỪ DATABASE THỰC TẾ CỦA BẠN
            // Lấy danh sách sân kèm theo thông tin loại môn thể thao (SportType) của sân đó
            var dsCourts = await _context.Courts
                                         .Include(c => c.SportType) 
                                         .ToListAsync();

            // 4. BIẾN ĐỔI DỮ LIỆU THÀNH ĐOẠN VĂN BẢN ĐỂ GỬI QUA CHO AI ĐỌC
            var sb = new StringBuilder();
            sb.AppendLine("Dưới đây là thông tin thực tế về danh sách sân đang hoạt động trong hệ thống của chúng ta để bạn tham khảo trả lời:");
            
            if (dsCourts.Any())
            {
                foreach (var court in dsCourts)
                {
                    // 1. Lấy đúng thuộc tính Name trong file Court.cs của bạn
                    string tenSan = court.Name; 

                    // 2. Lấy đúng thuộc tính PricePerHour kiểu decimal
                    decimal giaSan = court.PricePerHour; 

                    // 3. Lấy tên loại môn thể thao liên kết từ thuộc tính SportType
                    string loaiMon = court.SportType != null ? court.SportType.Name : "Chưa rõ";

                    // 4. Lấy trạng thái hoạt động (IsActive) để bot biết sân nào đang mở/đóng
                    string trangThai = court.IsActive ? "Đang hoạt động" : "Tạm bảo trì";

                    // Nối chuỗi dữ liệu sạch gửi cho AI đọc
                    sb.AppendLine($"- Sân: {tenSan} | Thuộc môn: {loaiMon} | Giá thuê: {giaSan} VND/giờ | Trạng thái: {trangThai}");
                }
            }
            else
            {
                sb.AppendLine("- Hiện tại hệ thống chưa có dữ liệu sân nào được khởi tạo.");
            }

            string dataContext = sb.ToString();

            // 5. ĐƯA DỮ LIỆU ĐÓ VÀO KHU VỰC "SYSTEM PROMPT"
            string systemPrompt = $@"
                Bạn là trợ lý ảo thông minh tích hợp trong Hệ thống đặt sân thể thao.
                Nhiệm vụ của bạn là hỗ trợ khách hàng hỏi thông tin về sân và giá cả.

                THÔNG TIN SÂN BÓNG THỰC TẾ TỪ DATABASE:
                {dataContext}

                QUY TẮC PHẢN HỒI KHÁCH HÀNG:
                - Chỉ dựa hoàn toàn vào dữ liệu thực tế được cung cấp ở trên để trả lời người dùng.
                - Nếu khách hỏi loại sân hoặc mức giá không khớp với dữ liệu bên trên, hãy lịch sự từ chối và nói rằng hệ thống hiện tại chưa có loại sân/mức giá đó, TUYỆT ĐỐI không được tự ý bịa ra.
                - Trả lời ngắn gọn, tập trung đúng vào câu hỏi, thân thiện và sử dụng tiếng Việt chuẩn.
            ";

            var client = _httpClientFactory.CreateClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", apiKey);

            var requestBody = new
            {
                model = "llama-3.1-8b-instant",
                messages = new[]
                {
                    new { role = "system", content = systemPrompt }, // Gửi kèm thông tin DB vào đây
                    new { role = "user", content = request.Prompt }
                },
                temperature = 0.3 // Hạ thấp xuống 0.3 để con AI bám sát dữ liệu DB cực kỳ nghiêm túc, không nói luyên thuyên
            };

            var jsonContent = new StringContent(
                JsonSerializer.Serialize(requestBody),
                Encoding.UTF8,
                "application/json"
            );

            var response = await client.PostAsync(apiUrl, jsonContent);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, new { success = false, error = errorContent });
            }

            var responseString = await response.Content.ReadAsStringAsync();
            using var document = JsonDocument.Parse(responseString);
            
            var root = document.RootElement;
            var replyText = root.GetProperty("choices")[0]
                                .GetProperty("message")
                                .GetProperty("content")
                                .GetString() ?? "";

            return Ok(new { success = true, reply = replyText });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { success = false, message = "Lỗi xử lý dữ liệu hệ thống hoặc kết nối AI: " + ex.Message });
        }
    }
}