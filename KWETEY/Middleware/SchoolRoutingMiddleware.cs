using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using KWETEY.Data;
using System.Threading.Tasks;

namespace KWETEY.Middleware
{
    public class SchoolRoutingMiddleware
    {
        private readonly RequestDelegate _next;

        public SchoolRoutingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, ApplicationDbContext db)
        {
            var host = context.Request.Host.Host;
            var parts = host.Split('.');

            if (parts.Length >= 3)
            {
                var subDomain = parts[0];
                var school = await db.Schools.FirstOrDefaultAsync(s => s.SchoolCode == subDomain);
                if (school != null)
                {
                    context.Items["SchoolName"] = school.SchoolName;
                    context.Items["SchoolLogo"] = school.LogoUrl;
                    context.Items["SchoolColor"] = school.BrandColor;
                }
            }
            await _next(context);
        }
    }
}