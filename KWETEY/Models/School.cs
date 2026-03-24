namespace KWETEY.Models
{
    // Changed name to 'School' to match your ApplicationDbContext
    public class School
    {
        public int Id { get; set; }

        // Adding '?' to fix the CS8618 warnings
        public string? SchoolName { get; set; }
        public string? SchoolCode { get; set; } // e.g., 'hmas'
        public string? BrandColor { get; set; } = "#00b0f0";
        public string? LogoUrl { get; set; }
        public string? Motto { get; set; }

        public bool IsActive { get; set; } = true;
    }
}