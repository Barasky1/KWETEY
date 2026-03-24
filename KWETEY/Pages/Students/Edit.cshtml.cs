using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using KWETEY.Data;
using KWETEY.Models;
using System.Linq;

namespace KWETEY.Pages.Students
{
    public class EditModel : PageModel
    {
        private readonly ApplicationDbContext _context;

        [BindProperty]
        public Student Student { get; set; }

        public EditModel(ApplicationDbContext context)
        {
            _context = context;
        }

        public void OnGet(int id)
        {
            Student = _context.Students.FirstOrDefault(s => s.Id == id);
        }

        public IActionResult OnPost()
        {
            _context.Students.Update(Student);
            _context.SaveChanges();

            return RedirectToPage("/Students/Index");
        }
    }
}