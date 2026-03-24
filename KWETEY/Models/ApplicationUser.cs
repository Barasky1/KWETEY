using Microsoft.AspNetCore.Identity;

namespace KWETEY.Models
{
    public class ApplicationUser : IdentityUser
    {
        // Adding '?' fixes the CS8618 "Non-nullable property" warnings
        public string? FullName { get; set; }
        public string? SchoolName { get; set; }
        public string? SchoolCode { get; set; }
        public string? SchoolLogoUrl { get; set; }
        public string? BrandColor { get; set; } = "#00b0f0";
    }
}