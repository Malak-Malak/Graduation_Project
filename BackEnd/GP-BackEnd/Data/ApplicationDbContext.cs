using Microsoft.EntityFrameworkCore;
using GP_BackEnd.Models;

namespace GP_BackEnd.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
           : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<TeamMember> TeamMembers { get; set; }
        public DbSet<TaskItem> TaskItems { get; set; }
        public DbSet<TaskComment> TaskComments { get; set; }
        public DbSet<TaskAttachment> TaskAttachments { get; set; }
        public DbSet<Appointment> Appointments { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<UserProfile> StudentProfiles { get; set; }         
        public DbSet<TeamProgressReport> TeamProgressReports { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Project -> Supervisor (User)
            modelBuilder.Entity<Project>()
                .HasOne(p => p.Supervisor)
                .WithMany()
                .HasForeignKey(p => p.SupervisorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Team -> Supervisor (User)
            modelBuilder.Entity<Team>()
                .HasOne(t => t.Supervisor)
                .WithMany(u => u.SupervisedTeams)
                .HasForeignKey(t => t.SupervisorId)
                .OnDelete(DeleteBehavior.Restrict);

            // TeamMember -> Team
            modelBuilder.Entity<TeamMember>()
                .HasOne(tm => tm.Team)
                .WithMany(t => t.TeamMembers)
                .HasForeignKey(tm => tm.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            // TeamMember -> User
            modelBuilder.Entity<TeamMember>()
                .HasOne(tm => tm.User)
                .WithMany(u => u.TeamMembers)
                .HasForeignKey(tm => tm.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // TaskItem -> Team
            modelBuilder.Entity<TaskItem>()
                .HasOne(ti => ti.Team)
                .WithMany(t => t.Tasks)
                .HasForeignKey(ti => ti.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            // TaskItem -> Project
            modelBuilder.Entity<TaskItem>()
                .HasOne(ti => ti.Project)
                .WithMany(p => p.Tasks)
                .HasForeignKey(ti => ti.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            // TaskComment -> TaskItem
            modelBuilder.Entity<TaskComment>()
                .HasOne(tc => tc.TaskItem)
                .WithMany(ti => ti.Comments)
                .HasForeignKey(tc => tc.TaskItemId)
                .OnDelete(DeleteBehavior.Cascade);

            // TaskComment -> User
            modelBuilder.Entity<TaskComment>()
                .HasOne(tc => tc.User)
                .WithMany(u => u.TaskComments)
                .HasForeignKey(tc => tc.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // TaskComment self-reference (replies)
            modelBuilder.Entity<TaskComment>()
                .HasOne(tc => tc.ParentComment)
                .WithMany(tc => tc.Replies)
                .HasForeignKey(tc => tc.ParentCommentId)
                .OnDelete(DeleteBehavior.Restrict);

            // TaskAttachment -> TaskItem
            modelBuilder.Entity<TaskAttachment>()
                .HasOne(ta => ta.TaskItem)
                .WithMany(ti => ti.Attachments)
                .HasForeignKey(ta => ta.TaskItemId)
                .OnDelete(DeleteBehavior.Cascade);

            // TaskAttachment -> User
            modelBuilder.Entity<TaskAttachment>()
                .HasOne(ta => ta.User)
                .WithMany(u => u.TaskAttachments)
                .HasForeignKey(ta => ta.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // TeamProgressReport -> Team
            modelBuilder.Entity<TeamProgressReport>()
                .HasOne(r => r.Team)
                .WithMany(t => t.ProgressReports)
                .HasForeignKey(r => r.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            // TeamProgressReport -> Project
            modelBuilder.Entity<TeamProgressReport>()
                .HasOne(r => r.Project)
                .WithMany(p => p.ProgressReports)
                .HasForeignKey(r => r.ProjectId)
                .OnDelete(DeleteBehavior.Restrict);

            // Appointment -> Team
            modelBuilder.Entity<Appointment>()
                .HasOne(a => a.Team)
                .WithMany(t => t.Appointments)
                .HasForeignKey(a => a.TeamId)
                .OnDelete(DeleteBehavior.Cascade);

            // Notification -> User
            modelBuilder.Entity<Notification>()
                .HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // StudentProfile -> User
            modelBuilder.Entity<UserProfile>()
                .HasOne(sp => sp.User)
                .WithOne(u => u.UserProfile)
                .HasForeignKey<UserProfile>(sp => sp.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}