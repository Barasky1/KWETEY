using Microsoft.AspNetCore.Mvc.RazorPages;
using System.Collections.Generic;
using System.Linq;

namespace KWETEY.Pages.Dashboard
{
    public class IndexModel : PageModel
    {
        // Properties for the School Summary Card
        public int ActiveClasses { get; set; } = 16;
        public int TotalStudents { get; set; } = 326;
        public int TotalParents { get; set; } = 198;
        public int TotalEmployees { get; set; } = 17;
        public int SmsAvailable { get; set; } = -2;

        // Data lists for the tables
        public List<AttendanceRow> StudentAttendance { get; set; } = new();
        public List<AttendanceRow> EmployeeAttendance { get; set; } = new();

        public void OnGet()
        {
            // Mocking the Student Attendance Data from the image
            StudentAttendance = new List<AttendanceRow>
            {
                new() { Name = "BS - BASIC 1", Count = 25 },
                new() { Name = "BS - BASIC 2", Count = 24 },
                new() { Name = "BS - BASIC 3", Count = 30 },
                new() { Name = "BS - BASIC 4A", Count = 20 },
                new() { Name = "BS - BASIC 5", Count = 19 },
                new() { Name = "BS - BASIC 6", Count = 33 },
                new() { Name = "PS - CRECHE", Count = 20 },
                new() { Name = "BS - GRADE 4B", Count = 20 },
                new() { Name = "HMAS - HMAS PAYMENTS", Count = 1 },
                new() { Name = "JHS00 - JHS 1", Count = 25 },
                new() { Name = "JHS00 - JHS 2", Count = 18 }
            };

            // Mocking the Employee Attendance Data from the image
            EmployeeAttendance = new List<AttendanceRow>
            {
                new() { Name = "ADMINISTRATION", Count = 3 },
                new() { Name = "UPPER PRIMARY", Count = 8 },
                new() { Name = "LOWER PRIMARY", Count = 1 },
                new() { Name = "PRE-SCHOOL", Count = 4 },
                new() { Name = "NON TEACHING STAFF", Count = 0 },
                new() { Name = "JHS", Count = 1 }
            };
        }
    }

    public class AttendanceRow
    {
        public string Name { get; set; } = "";
        public int Count { get; set; }
        public int Present { get; set; } = 0;
        public int Absent { get; set; } = 0;
        public int Exited { get; set; } = 0;
    }
}