using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using portfolio_service.Data;
using portfolio_service.Middleware;
using portfolio_service.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpContextAccessor();

builder.Services.AddHttpClient<IMarketServiceClient, MarketServiceClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["ServiceUrls:MarketService"] ?? "http://localhost:5002");
});

builder.Services.AddHttpClient("Kratos");

builder.Services.AddScoped<IPortfolioService, PortfolioService>();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy
            .WithOrigins("http://localhost", "http://localhost:80")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddOpenApi();
}

builder.WebHost.UseUrls(builder.Configuration["ASPNETCORE_URLS"] ?? "http://0.0.0.0:5001");

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors();
app.UseMiddleware<KratosMiddleware>();
app.MapControllers();

app.Run();
