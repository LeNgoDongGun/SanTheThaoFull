using System.Security.Claims;

namespace SanTheThaoAPI.Models;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PhoneNumber { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "Customer"; // Để mặc định là Customer luôn
    public bool IsActive { get; set; } = true;     // Để mặc định luôn khỏi gán tay
    public DateTime CreatedAt { get; set; } = DateTime.Now; // Tự lấy giờ hiện tại
    public string? AvatarUrl { get; set; }

}