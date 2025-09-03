"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Mail, Play, Pause, Trash2 } from "lucide-react"
import Link from "next/link"

export default function CampaignsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your email outreach campaigns
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Sample Campaign Card */}
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  Welcome Series Campaign
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  Automated welcome emails for new subscribers
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Play className="w-4 h-4 mr-2" />
                  Start
                </Button>
                <Button variant="outline" size="sm">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </Button>
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-400">Status</p>
                <p className="font-medium text-green-600 dark:text-green-400">Active</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Recipients</p>
                <p className="font-medium">1,234</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Sent</p>
                <p className="font-medium">1,200</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Open Rate</p>
                <p className="font-medium">24.5%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        <Card className="border-gray-200 dark:border-gray-700 border-dashed">
          <CardContent className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No campaigns yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first email campaign to start reaching your audience
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
