# Backend Updates Required

## Database Schema Updates

### 1. Add Ward Support to Existing Tables

```sql
-- Add ward_id column to users table
ALTER TABLE users ADD COLUMN ward_id TEXT;

-- Add ward_id column to reports table  
ALTER TABLE reports ADD COLUMN ward_id TEXT;

-- Create indexes for performance
CREATE INDEX idx_users_ward_id ON users(ward_id);
CREATE INDEX idx_reports_ward_id ON reports(ward_id);

-- Optional: Create wards table if you want to store ward data in backend
CREATE TABLE wards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ward_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  municipality_id UUID REFERENCES municipalities(id),
  geojson JSONB NOT NULL DEFAULT '{}',
  properties JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_wards_ward_id ON wards(ward_id);
CREATE INDEX idx_wards_municipality_id ON wards(municipality_id);
```

## API Endpoint Updates

### 1. User Registration Endpoint (`POST /api/auth/register`)

Update the registration endpoint to accept and store `ward_id`:

```javascript
// In your user registration handler
const { name, email, password, role, home_address, lat, lng, ward_id } = req.body;

// When creating user in Supabase
const { data: user, error } = await supabase
  .from('users')
  .insert({
    id: authUser.id,
    name,
    email,
    role,
    home_address,
    lat,
    lng,
    ward_id, // Add this field
    municipality_id // You might want to determine this based on ward_id
  })
  .select()
  .single();
```

### 2. User Profile Update Endpoint (`PUT /api/users/me`)

Update the profile update endpoint to handle `ward_id`:

```javascript
// In your profile update handler
const allowedUpdates = ['name', 'home_address', 'lat', 'lng', 'ward_id'];
const updates = {};

allowedUpdates.forEach(field => {
  if (req.body[field] !== undefined) {
    updates[field] = req.body[field];
  }
});

const { data: user, error } = await supabase
  .from('users')
  .update(updates)
  .eq('id', req.user.id)
  .select()
  .single();
```

### 3. Report Creation Endpoint (`POST /api/reports`)

Update the report creation endpoint to accept and store `ward_id`:

```javascript
// In your report creation handler
const { 
  title, 
  description, 
  category, 
  lat, 
  lng, 
  address, 
  ward_id, // Add this field
  photo_url 
} = req.body;

// When creating report
const { data: report, error } = await supabase
  .from('reports')
  .insert({
    title,
    description,
    category,
    lat,
    lng,
    address,
    ward_id, // Add this field
    municipality_id, // Determine from user or ward
    created_by: req.user.id,
    photo_url
  })
  .select(`
    *,
    created_by_user:users!created_by(id, name, email),
    municipalities(id, name, province)
  `)
  .single();
```

### 4. Add Ward-Based Filtering (Optional)

Add new endpoints or update existing ones to filter by ward:

```javascript
// GET /api/reports?ward_id=WARD_123
// In your reports endpoint
app.get('/api/reports', async (req, res) => {
  try {
    let query = supabase
      .from('reports')
      .select(`
        *,
        created_by_user:users!created_by(id, name, email),
        municipalities(id, name, province)
      `)
      .order('created_at', { ascending: false });

    // Add ward filtering
    if (req.query.ward_id) {
      query = query.eq('ward_id', req.query.ward_id);
    }

    // ... other filters

    const { data: reports, error } = await query;
    
    if (error) throw error;

    res.json({
      success: true,
      data: {
        reports,
        total: reports.length,
        limit: parseInt(req.query.limit) || 50,
        offset: parseInt(req.query.offset) || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

### 5. Ward Management Endpoints (Optional)

If you want to manage wards from the backend:

```javascript
// GET /api/wards - Get all wards
app.get('/api/wards', async (req, res) => {
  try {
    const { data: wards, error } = await supabase
      .from('wards')
      .select('*')
      .order('name');

    if (error) throw error;

    res.json({
      success: true,
      data: { wards }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/wards/:ward_id - Get specific ward
app.get('/api/wards/:ward_id', async (req, res) => {
  try {
    const { data: ward, error } = await supabase
      .from('wards')
      .select('*')
      .eq('ward_id', req.params.ward_id)
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data: { ward }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

## Response Format Updates

### Update User Response Format

```javascript
// Include ward_id in user responses
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "citizen",
  "home_address": "123 Main St",
  "lat": -26.2041,
  "lng": 28.0473,
  "ward_id": "WARD_123", // Add this field
  "municipality_id": "uuid",
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Update Report Response Format

```javascript
// Include ward_id in report responses
{
  "id": "uuid",
  "title": "Pothole on Main Street",
  "description": "Large pothole causing damage",
  "category": "roads",
  "lat": -26.2041,
  "lng": 28.0473,
  "address": "123 Main St",
  "ward_id": "WARD_123", // Add this field
  "status": "pending",
  "municipality_id": "uuid",
  "created_by": "uuid",
  "upvotes": 5,
  "created_at": "2024-01-01T00:00:00Z"
}
```

## Environment Variables

No new environment variables are required for this update.

## Testing

1. Test user registration with ward_id
2. Test profile updates with ward_id
3. Test report creation with ward_id
4. Test filtering reports by ward_id
5. Verify database constraints and indexes are working

## Migration Script

Run the database migration script provided in the frontend update to add the necessary columns and indexes.

## Notes

- The `ward_id` is determined on the frontend using point-in-polygon calculations
- Ward data is fetched from the external GeoJSON URL
- Consider caching ward data if you implement ward management endpoints
- The ward_id should be a string identifier that matches the ward IDs in the GeoJSON data