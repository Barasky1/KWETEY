#nullable disable

using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using KWETEY.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace KWETEY.Areas.Identity.Pages.Account
{
    [AllowAnonymous] // prevents redirect loop
    public class LoginModel : PageModel
    {
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ILogger<LoginModel> _logger;

        public LoginModel(SignInManager<ApplicationUser> signInManager, ILogger<LoginModel> logger)
        {
            _signInManager = signInManager;
            _logger = logger;
        }

        // Branding
        public string SchoolName { get; set; }
        public string SchoolLogo { get; set; }
        public string SchoolColor { get; set; }
        public string SchoolMotto { get; set; }

        [BindProperty]
        public InputModel Input { get; set; }

        public IList<AuthenticationScheme> ExternalLogins { get; set; }
        public string ReturnUrl { get; set; }

        [TempData]
        public string ErrorMessage { get; set; }

        public class InputModel
        {
            [Required]
            public string Username { get; set; }

            [Required]
            [DataType(DataType.Password)]
            public string Password { get; set; }

            public bool RememberMe { get; set; }
        }

        public async Task OnGetAsync(string returnUrl = null)
        {
            // Branding
            SchoolName = HttpContext.Items["SchoolName"] as string ?? "KWETEY";
            SchoolLogo = HttpContext.Items["SchoolLogo"] as string ?? "/default-shield.png";
            SchoolColor = HttpContext.Items["SchoolColor"] as string ?? "#00b0f0";
            SchoolMotto = HttpContext.Items["SchoolMotto"] as string ?? "ACCELERATING EXCELLENCE";

            if (!string.IsNullOrEmpty(ErrorMessage))
            {
                ModelState.AddModelError(string.Empty, ErrorMessage);
            }

            returnUrl ??= Url.Content("~/");

            await HttpContext.SignOutAsync(IdentityConstants.ExternalScheme);

            ExternalLogins = (await _signInManager.GetExternalAuthenticationSchemesAsync()).ToList();

            ReturnUrl = returnUrl;
        }

        public async Task<IActionResult> OnPostAsync(string returnUrl = null)
        {
            returnUrl ??= Url.Content("~/");

            // Branding again
            SchoolName = HttpContext.Items["SchoolName"] as string ?? "KWETEY";
            SchoolLogo = HttpContext.Items["SchoolLogo"] as string ?? "/default-shield.png";
            SchoolColor = HttpContext.Items["SchoolColor"] as string ?? "#00b0f0";
            SchoolMotto = HttpContext.Items["SchoolMotto"] as string ?? "ACCELERATING EXCELLENCE";

            if (ModelState.IsValid)
            {
                // ✅ Hardcoded admin check
                if (Input.Username == "barasky" && Input.Password == "1234")
                {
                    _logger.LogInformation("Admin logged in.");
                    return RedirectToAction("Dashboard", "SuperAdmin"); // go to SuperAdmin dashboard
                }

                // Otherwise, try normal Identity login
                var result = await _signInManager.PasswordSignInAsync(
                    Input.Username,
                    Input.Password,
                    Input.RememberMe,
                    lockoutOnFailure: false
                );

                if (result.Succeeded)
                {
                    _logger.LogInformation("User logged in.");
                    // ✅ Redirect school admins to their school details page
                    return RedirectToAction("Dashboard", "SuperAdmin");
                }

                if (result.IsLockedOut)
                {
                    _logger.LogWarning("User account locked out.");
                    ModelState.AddModelError(string.Empty, "Account locked.");
                    return Page();
                }

                ModelState.AddModelError(string.Empty, "Invalid login attempt.");
                return Page();
            }

            return Page();
        }
    }
}