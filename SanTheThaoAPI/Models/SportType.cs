namespace SanTheThaoAPI.Models;

public class SportType
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Icon { get; set; } = "";
    public string Description { get; set; } = "";
    public bool IsActive { get; set; }
    public ICollection<Court> Courts { get; set; } = new List<Court>();
}