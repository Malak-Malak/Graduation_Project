using GP_BackEnd.Data;
using GP_BackEnd.DTOs.Auth;
using GP_BackEnd.Models;
using GP_BackEnd.Settings;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace GP_BackEnd.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtSettings _jwtSettings;

        public AuthService(ApplicationDbContext context, IOptions<JwtSettings> jwtSettings)
        {
            _context = context;
            _jwtSettings = jwtSettings.Value;
        }

        // Login
        public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == dto.Username);

            if (user == null) return null;

            // Verify password
            if (!BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return null;

            var token = GenerateToken(user);

            return new LoginResponseDto
            {
                Token = token,
                Username = user.Username,
                Role = user.Role,
                UserId = user.Id
            };
        }

        // Submit registration request
        public async Task<bool> SubmitRegistrationRequestAsync(SubmitRegistrationRequestDto dto)
        {
            // Check if email exists in university records
            var universityRecord = await _context.UniversityRecords
                .FirstOrDefaultAsync(u => u.UniversityEmail == dto.UniversityEmail);

            if (universityRecord == null) return false;

            // If student, must be graduate
            if (universityRecord.Role == "Student" && !universityRecord.IsGraduate)
                return false;

            // Check if request already submitted
            var existingRequest = await _context.RegistrationRequests
                .FirstOrDefaultAsync(r => r.UniversityEmail == dto.UniversityEmail);

            if (existingRequest != null) return false;

            // Check if user already has an account
            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == dto.UniversityEmail);

            if (existingUser != null) return false;

            var request = new RegistrationRequest
            {
                UniversityEmail = dto.UniversityEmail,
                Status = "Pending",
                RequestedAt = DateTime.UtcNow
            };

            _context.RegistrationRequests.Add(request);
            await _context.SaveChangesAsync();
            return true;
        }

        // Generate JWT token
        private string GenerateToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSettings.SecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _jwtSettings.Issuer,
                audience: _jwtSettings.Audience,
                claims: claims,
                expires: DateTime.UtcNow.AddDays(_jwtSettings.ExpiryInDays),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}