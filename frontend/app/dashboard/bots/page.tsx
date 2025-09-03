"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Bot, Play, Pause, Trash2, Settings } from "lucide-react"
import Link from "next/link"

export default function BotsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Email Bots</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your AI-powered email outreach bots
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Bot
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Sample Bot Card */}
        <Card className="border-gray-200 dark:border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">
                  Sales Outreach Bot
                </CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-400">
                  AI-powered sales prospecting and follow-up
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
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
                <p className="text-gray-500 dark:text-gray-400">Emails Sent</p>
                <p className="font-medium">856</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Reply Rate</p>
                <p className="font-medium">12.3%</p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-400">Last Active</p>
                <p className="font-medium">2 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        <Card className="border-gray-200 dark:border-gray-700 border-dashed">
          <CardContent className="text-center py-12">
            <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No bots created yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first AI email bot to automate your outreach campaigns
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Bot
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
