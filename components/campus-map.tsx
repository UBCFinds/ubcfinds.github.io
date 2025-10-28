"use client"

// Import all libraries and components
import { useState, useEffect } from "react"
import { Search, Droplet, Bike, MapPin, AlertCircle, Coffee, Zap, Menu, X, ZoomIn, ZoomInIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { UtilityDetail } from "@/components/utility-detail"
import { ReportModal } from "@/components/report-modal"
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api"

// Defines what types of utilities are available and their structure
type UtilityType = "water" | "bike" | "washroom" | "emergency" | "food" | "charging"

// Defines Utility data structure
interface Utility {
  id: string
  name: string
  type: UtilityType
  building: string
  floor: string
  position: { lat: number; lng: number }
  status: "working" | "reported" | "maintenance"
  reports: number
  lastChecked: string
}

// Categories for filtering utilities 
const categories = [
  { id: "water", label: "Water Stations", icon: Droplet, color: "text-blue-400" },
  { id: "bike", label: "Bike Storage", icon: Bike, color: "text-green-400" },
  { id: "washroom", label: "Washrooms", icon: MapPin, color: "text-purple-400" },
  { id: "emergency", label: "Emergency", icon: AlertCircle, color: "text-red-400" },
  { id: "food", label: "Food & Drink", icon: Coffee, color: "text-orange-400" },
  { id: "charging", label: "Charging Stations", icon: Zap, color: "text-yellow-400" },
]

// Mock data for utilities on campus
// This is basically just a list of all the utilities with their details
// Eg: water foundtain in ICICS, bike cage in main mall, etc.
const mockUtilities: Utility[] = [
  {
    id: "1",
    name: "Water Fountain",
    type: "water",
    building: "ICICS",
    floor: "2nd Floor",
    position: { lat: 49.2611, lng: -123.2489 },
    status: "working",
    reports: 0,
    lastChecked: "2 hours ago",
  },
  {
    id: "2",
    name: "Bike Cage",
    type: "bike",
    building: "Main Mall",
    floor: "Ground",
    position: { lat: 49.2606, lng: -123.246 },
    status: "working",
    reports: 0,
    lastChecked: "1 day ago",
  },
  {
    id: "3",
    name: "Accessible Washroom",
    type: "washroom",
    building: "Nest",
    floor: "1st Floor",
    position: { lat: 49.2667, lng: -123.25 },
    status: "working",
    reports: 0,
    lastChecked: "3 hours ago",
  },
  {
    id: "4",
    name: "Emergency Phone",
    type: "emergency",
    building: "Library",
    floor: "Outside",
    position: { lat: 49.2677, lng: -123.2563 },
    status: "working",
    reports: 0,
    lastChecked: "1 week ago",
  },
  {
    id: "5",
    name: "Water Bottle Refill",
    type: "water",
    building: "ESB",
    floor: "1st Floor",
    position: { lat: 49.2625, lng: -123.2492 },
    status: "reported",
    reports: 2,
    lastChecked: "5 hours ago",
  },
  {
    id: "6",
    name: "Bike Repair Station",
    type: "bike",
    building: "Student Union",
    floor: "Outside",
    position: { lat: 49.265, lng: -123.2515 },
    status: "working",
    reports: 0,
    lastChecked: "2 days ago",
  },
  {
    id: "7",
    name: "Coffee Shop",
    type: "food",
    building: "Life Sciences",
    floor: "Ground",
    position: { lat: 49.2638, lng: -123.2528 },
    status: "working",
    reports: 0,
    lastChecked: "1 hour ago",
  },
  {
    id: "8",
    name: "Charging Station",
    type: "charging",
    building: "Nest",
    floor: "2nd Floor",
    position: { lat: 49.2668, lng: -123.2498 },
    status: "working",
    reports: 0,
    lastChecked: "4 hours ago",
  },
]

// Map container style and options
const mapContainerStyle = {
  width: "100%",
  height: "100%",
}

// Center of UBC Campus
const ubcCenter = {
  lat: 49.2606,
  lng: -123.246,
}

// Map options including restrictions to UBC campus area
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: true,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ],
  //49.282569, -123.275719
  //49.236203, -123.195687
  restriction: {
    latLngBounds: {
      north: 49.292569,
      south: 49.236203,
      east: -123.195687,
      west: -123.285719,
    },
    strictBounds: true,
  },
}

// Main CampusMap component 
// Renders the map, sidebar, and handles state management
export function CampusMap() {

  // Literally just an fsm 
  const [selectedCategories, setSelectedCategories] = useState<UtilityType[]>([
    "water",
    "bike",
    "washroom",
    "emergency",
    "food",
    "charging",
  ])
  const [selectedUtility, setSelectedUtility] = useState<Utility | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showReportModal, setShowReportModal] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Get user's location on component mount
  useEffect(() => {
    // Get the user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting user location:", error)
        },
      )
    } else {
      console.error("Geolocation is not supported by this browser.")
    }
  }, [])

  // Toggle category selection for filtering
  // If category is already selected, remove it; otherwise, add it
  // why am I even commenting this lmao (auto-suggested comment btw I had to include it)
  const toggleCategory = (categoryId: UtilityType) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId],
    )
  }

  // Filter utilities based on selected categories and search query
  // Checks if the utility type is in selected categories and if the name or building includes the search query
  // Only checks the search if the search query is not empty
  const filteredUtilities = mockUtilities.filter(
    (utility) =>
      selectedCategories.includes(utility.type) &&
      (searchQuery === "" ||
        utility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        utility.building.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const getCategoryColor = (type: UtilityType) => {
    return categories.find((cat) => cat.id === type)?.color || "text-gray-400"
  }

  // Loads an instance of the map
  const onLoad = (mapInstance: google.maps.Map) => {
    console.log("Map loaded:", mapInstance)
    setMap(mapInstance)
  }


  const getMarkerIcon = (utility: Utility) => {
    if (typeof window === "undefined" || !window.google) {
      return undefined
    }

    // Get color based on utility status
    const baseColor = utility.status === "reported" ? "#ef4444" : "#3b82f6"

    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: baseColor,
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2,
      scale: selectedUtility?.id === utility.id ? 12 : 8,
    }
  }


  // Handle what happens when a utility is selected
  const handleUtilitySelect = (utility: Utility) => {
    console.log("Handling utility selection for:", utility)
    console.log("Current map instance:", map)
    setSelectedUtility(utility)

    if (map){
      map.setZoom(15)
      const panPos = new google.maps.LatLng(utility.position.lat, utility.position.lng+0.003)
      map.panTo(panPos)
    }
    
  }

  return (
    <div className="relative h-full w-full bg-background">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-20 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div>
              <h1 className="text-xl font-bold text-balance">UBC Campus Finder</h1>
              <p className="text-xs text-muted-foreground">We make it easy to find stuff on campus</p>
            </div>
          </div>
          <Button onClick={() => setShowReportModal(true)} size="sm">
            Report Issue
          </Button>
        </div>
      </header>


      {/* Toggle Sidebar Button - always visible */}
      <Button
        variant="default"
        size="icon"
        className={`absolute top-20 z-50 ${sidebarOpen ? "left-[330px]" : "left-[10px]"} text-white-700 hover:text-gray-900 bg-black/70 hover:bg-white/90 border-gray-300 `}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>



      {/* Sidebar */}
      <aside
        className={cn(
          "absolute top-16 left-0 bottom-0 z-20 w-80 bg-card border-r border-border transition-transform duration-300 overflow-y-auto",
          !sidebarOpen && "-translate-x-full",
        )}
      >
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search utilities or buildings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Filter by Category</h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const Icon = category.icon
                const isSelected = selectedCategories.includes(category.id as UtilityType)
                return (
                  <button
                    key={category.id}
                    onClick={() => toggleCategory(category.id as UtilityType)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground",
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isSelected && category.color)} />
                    <span className="text-sm font-medium">{category.label}</span>
                    <Badge variant="secondary" className="ml-auto">
                      {mockUtilities.filter((u) => u.type === category.id).length}
                    </Badge>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Utility List */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Nearby Utilities ({filteredUtilities.length})</h3>
            <div className="space-y-2">
              {filteredUtilities.map((utility) => (
                <button
                  key={utility.id}                  
                  onClick={() => handleUtilitySelect(utility)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors",
                    selectedUtility?.id === utility.id
                      ? "bg-primary/10 border-primary"
                      : "bg-card border-border hover:bg-muted",
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{utility.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {utility.building} • {utility.floor}
                      </p>
                    </div>
                    {utility.status === "reported" && (
                      <Badge variant="destructive" className="text-xs">
                        {utility.reports} reports
                      </Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      
      {/* Map */}
      <div
        className={cn(
          "absolute top-16 bottom-0 right-0 transition-all duration-300",
          sidebarOpen ? "left-80" : "left-0",
        )}
      >
        <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={userLocation || ubcCenter} // Center on user location if available
        zoom={userLocation ? 17 : 15} // Zoom in closer if user location is available
        options={mapOptions}
        onLoad={onLoad}
      >
        {/*User's current location marker*/}
        {userLocation && (
          <Marker
            position={userLocation}
            icon={{
              url: "/location_icon.png",
              scaledSize: new window.google.maps.Size(32, 32),
              anchor: new window.google.maps.Point(16, 16),
              //fillColor: "#34D399",
              //fillOpacity: 1,
              //strokeColor: "#ffffff",
              //strokeWeight: 2,
              //scale: 8,
            }}
            title="You are here"
          />
        )}

        {/* Utility Markers */}
        {filteredUtilities.map((utility) => (
          <Marker
            key={utility.id}
            position={utility.position}
            onClick={() => {
              handleUtilitySelect(utility)
              //setSelectedUtility(utility)
            }}
            icon={getMarkerIcon(utility)}
            title={utility.name}
          />
        ))}



      </GoogleMap>
    </LoadScript>

        {/* Legend */}
        <Card className="absolute bottom-4 left-4 w-64">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Map Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded-full bg-primary" />
              <span>Working</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="h-3 w-3 rounded-full bg-destructive" />
              <span>Reported Issue</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utility Detail Panel */}
      {selectedUtility && (
        <UtilityDetail
          utility={selectedUtility}
          onClose={() => {
            setSelectedUtility(null)
          }}
          onReport={() => {
            setShowReportModal(true)
          }}
          onGetDirections={() => {}}
        />
      )}

      {/* Report Modal */}
      {showReportModal && <ReportModal utility={selectedUtility} onClose={() => setShowReportModal(false)} />}
    </div>
  )
}
