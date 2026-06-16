using System;
using System.Collections.Generic;

namespace SanTheThaoAPI.Models;

public partial class PostReview
{
    public int Id { get; set; }

    public int PostId { get; set; }

    public int Rating { get; set; }

    public string Comment { get; set; } = null!;

    public string? UserName { get; set; }
}
