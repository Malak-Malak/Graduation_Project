namespace GP_BackEnd.DTOs.HeadOfDepartment
{
    public class UpdateTeamSlotDto
    {
        public int TeamId { get; set; }
        public int NewSlotId { get; set; }
        public string? Instructors { get; set; }

    }
}