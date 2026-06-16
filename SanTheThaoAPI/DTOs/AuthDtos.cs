namespace SanTheThaoAPI.DTOs;

public record LoginDto(string Email = "", string Password = "");

public record RegisterDto(string FullName = "", string Email = "", string PhoneNumber = "", string Password = "");

public class AuthResponseDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Role { get; set; } = "";

    public AuthResponseDto() { }
    
    // Tự động bốc tách dữ liệu từ Model User sang DTO
    public AuthResponseDto(Models.User u)
    {
        Id = u.Id;
        FullName = u.FullName ?? "";
        Email = u.Email ?? "";
        Role = u.Role ?? "Customer";
    }
}

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