"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { testAllVerificationBuckets, checkStorageHealth, type StorageTestResult } from "@/lib/storageDebug"
import { Database, CheckCircle, XCircle, AlertCircle } from "lucide-react"

export default function TestStoragePage() {
  const [testing, setTesting] = useState(false)
  const [results, setResults] = useState<StorageTestResult[]>([])
  const [healthCheck, setHealthCheck] = useState<{ healthy: boolean; issues: string[] } | null>(null)

  const runTests = async () => {
    setTesting(true)
    setResults([])
    setHealthCheck(null)
    
    try {
      const testResults = await testAllVerificationBuckets()
      setResults(testResults)
    } catch (error) {
      console.error('Test failed:', error)
    }
    
    setTesting(false)
  }

  const runHealthCheck = async () => {
    setTesting(true)
    setHealthCheck(null)
    
    try {
      const health = await checkStorageHealth()
      setHealthCheck(health)
    } catch (error) {
      console.error('Health check failed:', error)
    }
    
    setTesting(false)
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
            <Database className="w-8 h-8" />
            Storage Bucket Test
          </h1>
          <p className="text-muted-foreground">
            Test if your Supabase storage buckets and policies are configured correctly
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Health Check</CardTitle>
            <CardDescription>
              Run a quick test to see if uploads are working
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runHealthCheck} disabled={testing} className="w-full">
              {testing ? "Testing..." : "Run Health Check"}
            </Button>

            {healthCheck && (
              <div className={`p-4 rounded-lg border ${
                healthCheck.healthy 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-start gap-3">
                  {healthCheck.healthy ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <h3 className={`font-semibold mb-2 ${
                      healthCheck.healthy ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {healthCheck.healthy ? "✅ Storage is healthy!" : "❌ Storage issues detected"}
                    </h3>
                    {healthCheck.issues.length > 0 && (
                      <ul className="space-y-1 text-sm text-red-800">
                        {healthCheck.issues.map((issue, i) => (
                          <li key={i}>• {issue}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Bucket Tests</CardTitle>
            <CardDescription>
              Test all permissions (list, upload, read, delete) for each bucket
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={runTests} disabled={testing} className="w-full">
              {testing ? "Testing..." : "Run Detailed Tests"}
            </Button>

            {results.length > 0 && (
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <h3 className="font-semibold text-lg">{result.bucket}</h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <TestResultItem label="List Files" passed={result.canList} />
                      <TestResultItem label="Upload Files" passed={result.canUpload} />
                      <TestResultItem label="Read Files" passed={result.canRead} />
                      <TestResultItem label="Delete Files" passed={result.canDelete} />
                    </div>

                    {result.error && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                        <strong>Error:</strong> {result.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600" />
              How to Fix Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p>If tests fail, you need to apply storage policies:</p>
            
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>Go to your Supabase Dashboard</li>
              <li>Navigate to <strong>SQL Editor</strong></li>
              <li>Copy the SQL from <code>storage-policies.sql</code> file</li>
              <li>Paste and run it</li>
              <li>Come back and run these tests again</li>
            </ol>

            <div className="mt-4 p-3 bg-white border border-blue-200 rounded">
              <p className="font-semibold mb-2">The policies should allow:</p>
              <ul className="space-y-1 text-xs">
                <li>✓ Users to upload files to their own folder ({`{user_id}/filename`})</li>
                <li>✓ Users to read files from their own folder</li>
                <li>✓ Users to update/delete files in their own folder</li>
                <li>✗ Users cannot access other users' files</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="outline" onClick={() => window.location.href = '/'}>
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  )
}

function TestResultItem({ label, passed }: { label: string; passed: boolean }) {
  return (
    <div className={`flex items-center gap-2 p-2 rounded ${
      passed ? 'bg-green-50' : 'bg-red-50'
    }`}>
      {passed ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <XCircle className="w-4 h-4 text-red-600" />
      )}
      <span className={`text-sm ${
        passed ? 'text-green-900' : 'text-red-900'
      }`}>
        {label}
      </span>
    </div>
  )
}

