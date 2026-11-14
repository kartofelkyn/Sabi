using Microsoft.EntityFrameworkCore;
using Sabi.Api.Data;
using Sabi.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

// Register controllers
builder.Services.AddControllers();

// Register services
builder.Services.AddScoped<FinanceService>();
builder.Services.AddScoped<CategoryService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register EF Core
builder.Services.AddDbContext<SabiDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSabiFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


var app = builder.Build();



// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapGet("/api/status", () =>
{
    return new
    {
        name = "Sabi",
        status = "Running"
    };
});
// Cors

app.UseRouting();

app.UseCors("AllowSabiFrontend");

app.UseAuthorization();

// Register controller routes
app.MapControllers();

app.Run();

