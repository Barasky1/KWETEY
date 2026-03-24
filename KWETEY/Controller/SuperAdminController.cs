using KWETEY.Data;
using KWETEY.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

[Authorize(Roles = "SuperAdmin")] // only superadmins can access
public class SuperAdminController : Controller
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public SuperAdminController(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    // GET: /SuperAdmin/Dashboard
    public async Task<IActionResult> Dashboard()
    {
        var schools = await _context.Schools.ToListAsync();
        return View(schools);
    }

    // GET: /SuperAdmin/CreateSchool
    public IActionResult CreateSchool()
    {
        return View();
    }

    // POST: /SuperAdmin/CreateSchool
    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> CreateSchool(string schoolName, string schoolCode, string brandColor, string logoUrl, string motto, string adminUsername, string adminPassword)
    {
        if (string.IsNullOrEmpty(schoolName) || string.IsNullOrEmpty(adminUsername) || string.IsNullOrEmpty(adminPassword))
        {
            ModelState.AddModelError("", "School name, admin username, and password are required.");
            return View();
        }

        // ✅ Create school record
        var school = new School
        {
            SchoolName = schoolName,
            SchoolCode = schoolCode,
            BrandColor = string.IsNullOrEmpty(brandColor) ? "#00b0f0" : brandColor,
            LogoUrl = logoUrl,
            Motto = motto,
            IsActive = true
        };
        _context.Schools.Add(school);
        await _context.SaveChangesAsync();

        // ✅ Create admin user for that school (store school info directly in ApplicationUser)
        var admin = new ApplicationUser
        {
            UserName = adminUsername,
            Email = $"{adminUsername}@{schoolName}.com",
            SchoolName = schoolName,
            SchoolCode = schoolCode,
            SchoolLogoUrl = logoUrl,
            BrandColor = brandColor
        };
        var result = await _userManager.CreateAsync(admin, adminPassword);

        if (result.Succeeded)
        {
            await _userManager.AddToRoleAsync(admin, "SchoolAdmin");
            return RedirectToAction("Dashboard");
        }

        foreach (var error in result.Errors)
        {
            ModelState.AddModelError("", error.Description);
        }

        return View();
    }

    // GET: /SuperAdmin/SchoolDetails/5
    public async Task<IActionResult> SchoolDetails(int id)
    {
        var school = await _context.Schools.FirstOrDefaultAsync(s => s.Id == id);

        if (school == null)
        {
            return NotFound();
        }

        return View(school);
    }
}