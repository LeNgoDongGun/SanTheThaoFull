using SanTheThaoAPI.Models; // Thêm dòng này để nhận diện class User từ thư mục Models

namespace SanTheThaoAPI.DTOs;

public class LoginDto
{
    public string Email { get; set; } = "";
    public string Password { get; set; } = "";
}

public class RegisterDto
{
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PhoneNumber { get; set; } = "";
    public string Password { get; set; } = "";
}

public class AuthResponseDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Role { get; set; } = "";

    // --- BẮT BUỘC THÊM CỤM NÀY ĐỂ FIX TRIỆT ĐỂ LỖI CS1729 ---
    public AuthResponseDto() { }
    

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







    public class ForgotEmailDto
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordDirectDto
    {
        public string Email { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }