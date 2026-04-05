namespace GP_BackEnd.DTOs.FileSystem
{
    public class AddAttachmentDto
    {
        public string FilePath { get; set; }
        public string? Description { get; set; }
        public int TaskItemId { get; set; }
    }
}