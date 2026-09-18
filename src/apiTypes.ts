// Response from /onair/session endpoint
export interface ProclaimAuthResponse {
	proclaimAuthToken: string
}

export enum aspectRatio {
	SixteenByNine = 'SixteenByNine',
	FourByThree = 'FourByThree',
}

// Response from /presentations/onair endpoint
export interface Presentation {
	sessionId: string // GUID, distinct from the on-air session ID returned from /onair/session
	groupId: string // The group that the presentation belongs to
	groupName: string // Name of the group that the presentation belongs to
	id: string // GUID
	localRevision: number // Timestamp of the last time the presentation was modified
	title: string // Presentation title, e.g. "Sunday Service"
	logoServiceItemId: string
	dateGiven: number // The service date, but not time of day
	startTime: number // When the presentation went on-air, *not* the scheduled start time!
	aspectRatio: aspectRatio // The aspect ratio of the presentation
	warmupStartIndex: number // Index of the first service item in the warmup service section
	serviceStartIndex: number // Index of the first service item in the service section
	postServiceStartIndex: number // Index of the first service item in the post-service section
	serviceItems: Array<ServiceItem> // The service items within the presentation
}

export enum ServiceItemKind {
	Announcement = 'Announcement',
	Content = 'Content',
	StageDirectionCue = 'StageDirectionCue',
	SongLyrics = 'SongLyrics',
	Grouping = 'Grouping',
	// More to follow - pending availability of API docs
}

// Items within a presentation
export interface ServiceItem {
	id: string // GUID of the service item
	title: string // Title of the service item
	notes: string // Notes for the service item
	kind: ServiceItemKind // The kind of service item, e.g. "SongLyrics"
	slides: Array<Slide> // The individual slides within the service item
}

// Slides within a service item
export interface Slide {
	localRevision: number // Timestamp of the last time the slide was modified
	index: number // Slide index within the service item
}
