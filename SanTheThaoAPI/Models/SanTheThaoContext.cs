using Microsoft.EntityFrameworkCore;
namespace SanTheThaoAPI.Models;

public class SanTheThaoContext : DbContext
{
    public SanTheThaoContext(DbContextOptions<SanTheThaoContext> options) : base(options) { }

    public DbSet<SportType> SportTypes { get; set; }
    public DbSet<Court> Courts { get; set; }
    public DbSet<User> Users { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<Review> Reviews { get; set; }
    public DbSet<NewsPost> NewsPosts { get; set; }
}