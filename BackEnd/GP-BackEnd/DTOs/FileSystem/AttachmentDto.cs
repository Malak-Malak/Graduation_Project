namespace GP_BackEnd.DTOs.FileSystem
{
    public class AttachmentDto
    {
        public int Id { get; set; }
        public string FilePath { get; set; }
        public string? Description { get; set; }
        public DateTime UploadedAt { get; set; }
        public int UploadedByUserId { get; set; }
        public string UploadedByName { get; set; }
    }
}