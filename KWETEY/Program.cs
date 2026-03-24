using KWETEY.Data;
using KWETEY.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// 1. Setup Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddDatabaseDeveloperPageExceptionFilter();

// 2. Setup Identity
builder.Services.AddDefaultIdentity<ApplicationUser>(options =>
{
    options.SignIn.RequireConfirmedAccount = false; // easier during development
})
.AddEntityFrameworkStores<ApplicationDbContext>();

// 3. Configure cookie paths
builder.Services.ConfigureApplicationCookie(options =>
{
    options.LoginPath = "/Identity/Account/Login";        // correct login URL
    options.AccessDeniedPath = "/Identity/Account/Login"; // redirect if unauthorized
});

builder.Services.AddRazorPages();
builder.Services.AddControllersWithViews(); // ✅ enable MVC controllers

var app = builder.Build();

// 4. Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.UseMigrationsEndPoint();
}
else
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthentication();
app.UseAuthorization();

// 5. Custom Middleware AFTER auth so it sees logged-in user
app.UseMiddleware<KWETEY.Middleware.SchoolRoutingMiddleware>();

// 6. Redirect root "/" to login
app.MapGet("/", context =>
{
    context.Response.Redirect("/Identity/Account/Login");
    return Task.CompletedTask;
});

// 7. Map Pages & Controllers
app.MapStaticAssets();
app.MapRazorPages().WithStaticAssets();
app.MapControllers(); // ✅ register controller routes

app.Run();
