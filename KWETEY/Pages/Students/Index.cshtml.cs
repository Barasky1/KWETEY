using KWETEY.Data;
using KWETEY.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Collections.Generic;
using System.Linq;

namespace KWETEY.Pages.Students
{
    public class IndexModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        public List<Student> Students { get; set; }

        public IndexModel(ApplicationDbContext context)
        {
            _context = context;
        }
        public IActionResult OnPostDelete(int id)
        {
            var student = _context.Students.FirstOrDefault(s => s.Id == id);

            if (student != null)
            {
                _context.Students.Remove(student);
                _context.SaveChanges();
            }

            return RedirectToPage();
        }
        public void OnGet()
        {
            Students = _context.Students.ToList();
        }
    }
}