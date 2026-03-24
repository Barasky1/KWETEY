using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using KWETEY.Models; // This allows the database to 'see' Student and School

namespace KWETEY.Data
{
    // Inheriting from IdentityDbContext<ApplicationUser> connects your custom user fields
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        // These are the database tables for the KWETEY system
        // Make sure the names 'Student' and 'School' match your .cs files exactly
        public DbSet<Student> Students { get; set; }
        public DbSet<School> Schools { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // This ensures the Identity (login) tables are created with the correct schema
        }
    }
}