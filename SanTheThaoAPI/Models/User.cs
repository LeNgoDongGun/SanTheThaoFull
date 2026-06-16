using System.Security.Claims;

namespace SanTheThaoAPI.Models;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string PhoneNumber { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "Customer"; 
    public bool IsActive { get; set; } = true;     
    public DateTime CreatedAt { get; set; } = DateTime.Now; 
    public string? AvatarUrl { get; set; }

    public User() { }
    
    // Constructor hỗ trợ bốc tách dữ liệu mạng xã hội nhanh
    public User(IEnumerable<Claim> claims)
    {
        FullName = claims.FirstOrDefault(c => c.Type == ClaimTypes.Name)?.Value ?? "Social User";
        Email = claims.FirstOrDefault(c => c.Type == ClaimTypes.Email)?.Value 
                ?? (claims.FirstOrDefault(c => c.Type == "urn:github:login")?.Value is string git ? $"{git}@github.local" : "");
    }
}