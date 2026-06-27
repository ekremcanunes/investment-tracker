# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk AS build
WORKDIR /src
COPY . .
RUN dotnet publish -c Release -o /publish

# Stage 2: Runtime
FROM mcr.microsoft.com/dotnet/aspnet
WORKDIR /app
COPY --from=build /publish .
CMD ["dotnet", "market-service.dll"]