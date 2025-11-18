"use client"

import { useEffect, useState } from "react"
import { getDatingMatches, getMatrimonyMatches, type Match } from "@/lib/matchmakingService"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabaseClient"

interface MatchListProps {
  mode: 'dating' | 'matrimony'
  onMatchClick: (match: Match) => void
}

export function MatchList({ mode, onMatchClick }: MatchListProps) {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadMatches() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setLoading(false)
          return
        }

        const matchData = mode === 'dating' 
          ? await getDatingMatches(user.id)
          : await getMatrimonyMatches(user.id)
        
        setMatches(matchData)
      } catch (error) {
        console.error('Error loading matches:', error)
      } finally {
        setLoading(false)
      }
    }

    loadMatches()
  }, [mode])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Loading matches...</p>
        </div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="space-y-2">
            <p className="text-muted-foreground">No matches yet.</p>
            <p className="text-sm text-muted-foreground">Keep swiping to find your match!</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Card 
          key={match.id} 
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => onMatchClick(match)}
        >
          <CardContent className="p-4 flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={match.matchedUserPhoto} alt={match.matchedUserName} />
              <AvatarFallback className="text-lg">
                {match.matchedUserName[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{match.matchedUserName}</h3>
              {match.mutualInterests && match.mutualInterests.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {match.mutualInterests.length} mutual {match.mutualInterests.length === 1 ? 'interest' : 'interests'}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Matched {new Date(match.matchedAt).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

