namespace SanTheThaoAPI.DTOs;

// Dùng Record Positional Syntax - Ngắn gọn trên đúng 1 dòng cho mỗi DTO nhận dữ liệu
public record LoginDto(string Email = "", string Password = "");

public record RegisterDto(string FullName = "", string Email = "", string PhoneNumber = "", string Password = "");

// DTO trả về kết quả: Thêm Constructor nhận vào Model User để Controller không phải map tay
public class AuthResponseDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Role { get; set; } = "";

    public AuthResponseDto() { }
    
    // Nhận trực tiếp model User để tự bốc tách dữ liệu
    public AuthResponseDto(Models.User u)
    {
        Id = u.Id;
        FullName = u.FullName ?? "";
        Email = u.Email ?? "";
        Role = u.Role ?? "Customer";
    }
}

// Giữ nguyên class Generic này nhưng viết định dạng cho thoáng mắt
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; } = "";
    public T? Data { get; set; }

    public static ApiResponse<T> Ok(T data, string message = "Thành công") 
        => new() { Success = true, Message = message, Data = data };

    public static ApiResponse<T> Fail(string message) 
        => new() { Success = false, Message = message };
}