namespace KWETEY.Models
{
    public class Student
    {
        public int Id { get; set; }

        // Using these specific names fixes the CS1061 errors in your Create/Edit pages
        public string? Name { get; set; }
        public string? Class { get; set; }

        public string? AdmissionNumber { get; set; }

        // This tracks when they joined the KWETEY system
        public DateTime AdmissionDate { get; set; } = DateTime.Now;

        // Add any other fields you need here (e.g., ParentName, Gender)
        public string? Gender { get; set; }
    }
}