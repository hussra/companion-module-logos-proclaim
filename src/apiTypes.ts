// Response from /onair/session endpoint
export interface ProclaimAuthResponse {
	proclaimAuthToken: string
}

enum aspectRatio {
	SixteenByNine = 'SixteenByNine',
	FourByThree = 'FourByThree',
}

// Response from /presentations/onair endpoint
export interface Presentation {
	sessionId: string
	groupId: string
	groupName: string
	id: string
	localRevision: number
	title: string
	logoServiceItemId: string
	dateGiven: number
	startTime: number // When the presentation went on-air, *not* the scheduled start time!
	aspectRatio: aspectRatio
	warmupStartIndex: number
	serviceStartIndex: number
	postServiceStartIndex: number
	serviceItems: Array<ServiceItem>
}

enum ServiceItemKind {
	Announcement = 'Announcement',
	Content = 'Content',
	StageDirectionCue = 'StageDirectionCue',
	SongLyrics = 'SongLyrics',
	Grouping = 'Grouping',
	// More to follow - pending availability of API docs
}

// Items within a presentation
interface ServiceItem {
	id: string
	title: string
	notes: string
	kind: ServiceItemKind
	slides: Array<Slide>
}

// Slides within a service item
interface Slide {
	localRevision: number
	index: number
}
