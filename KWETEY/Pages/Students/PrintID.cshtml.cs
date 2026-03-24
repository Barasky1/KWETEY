using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using KWETEY.Data;
using KWETEY.Models;

namespace KWETEY.Pages.Students
{
    public class PrintIDModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        public PrintIDModel(ApplicationDbContext context)
        {
            _context = context;
        }

        // Student Properties - added '?' for null safety
        public string? StudentFullName { get; set; }
        public string? StudentAdmissionId { get; set; }
        public string? StudentClass { get; set; }
        public string? StudentPhotoUrl { get; set; }
        public string? GuardianPhone { get; set; }

        // Institutional Branding Properties
        public string? SchoolName { get; set; }
        public string? SchoolLogoUrl { get; set; }
        public string? SchoolColor { get; set; }

        public async Task<IActionResult> OnGetAsync(string id)
        {
            if (string.IsNullOrEmpty(id)) return NotFound();

            // 1. Fetch Student Data (Removed .Include(s => s.Guardian) to fix the red underline)
            var student = await _context.Students
                .FirstOrDefaultAsync(s => s.AdmissionNumber == id);

            if (student == null) return NotFound();

            // 2. Identify the School based on the URL (via Middleware context)
            SchoolName = HttpContext.Items["SchoolName"] as string ?? "KWETEY";
            SchoolLogoUrl = HttpContext.Items["SchoolLogo"] as string ?? "/images/default-logo.png";
            SchoolColor = HttpContext.Items["SchoolColor"] as string ?? "#00b0f0";

            // 3. Map Student Data using the NEW property names
            StudentFullName = student.Name; // Changed from FirstName/LastName
            StudentAdmissionId = student.AdmissionNumber;
            StudentClass = student.Class; // Changed from CurrentClass

            // Handle profile picture (Fallback)
            StudentPhotoUrl = "/images/default-avatar.png";

            // If you add a GuardianPhone field to Student.cs later, you can map it here
            GuardianPhone = "N/A";

            return Page();
        }
    }
}