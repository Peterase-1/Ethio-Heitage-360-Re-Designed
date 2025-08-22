import { useState } from "react";
import { Mail, MailOpen, Reply, Trash2, Search, Filter } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { useDashboard } from "../../context/DashboardContext";
import { toast } from "sonner";

export function CustomerMessagesPage() {
  const { messages, markMessageAsRead } = useDashboard();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");

  const filteredMessages = messages.filter((message) => {
    const matchesSearch =
      message.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || message.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleMessageClick = (messageId) => {
    const message = messages.find((m) => m.id === messageId);
    if (message && message.status === "unread") {
      markMessageAsRead(messageId);
    }
    setSelectedMessage(messageId);
  };

  const handleReply = async (messageId) => {
    if (!replyText.trim()) {
      toast.error("Please enter a reply message");
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const message = messages.find((m) => m.id === messageId);
      toast.success(`Reply sent to ${message?.customerName}`);

      markMessageAsRead(messageId);
      setReplyText("");
      setSelectedMessage(null);
    } catch (error) {
      toast.error("Failed to send reply");
    }
  };

  const handleDelete = (messageId) => {
    toast.info("Delete functionality would be implemented here");
  };

  const getStatusIcon = (status) => {
    return status === "unread" ? Mail : MailOpen;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Customer Messages
          </h1>
          <p className="text-gray-600">
            Manage customer inquiries and communications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {messages.filter((m) => m.status === "unread").length} unread
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            label: "Total Messages",
            value: messages.length,
            color: "bg-blue-100 text-blue-800",
          },
          {
            label: "Unread",
            value: messages.filter((m) => m.status === "unread").length,
            color: "bg-red-100 text-red-800",
          },
          {
            label: "Replied",
            value: messages.filter((m) => m.status === "replied").length,
            color: "bg-green-100 text-green-800",
          },
        ].map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-10 h-10 rounded-full ${stat.color} flex items-center justify-center`}
                >
                  <Mail className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="replied">Replied</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Messages ({filteredMessages.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredMessages.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  No messages found
                </h3>
                <p className="text-gray-600">
                  {searchTerm || statusFilter !== "all"
                    ? "Try adjusting your filters"
                    : "Customer messages will appear here"}
                </p>
              </div>
            ) : (
              filteredMessages.map((message) => {
                const StatusIcon = getStatusIcon(message.status);

                return (
                  <div
                    key={message.id}
                    className={`p-4 border rounded-lg hover:shadow-sm transition-all cursor-pointer ${
                      message.status === "unread"
                        ? "border-green-300 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => handleMessageClick(message.id)}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <StatusIcon
                          className={`w-5 h-5 mt-1 ${
                            message.status === "unread"
                              ? "text-green-600"
                              : "text-gray-400"
                          }`}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4
                              className={`font-medium ${
                                message.status === "unread"
                                  ? "text-gray-900"
                                  : "text-gray-700"
                              }`}
                            >
                              {message.customerName}
                            </h4>
                            <Badge
                              variant={
                                message.status === "unread"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {message.status}
                            </Badge>
                          </div>

                          <p className="text-sm text-gray-600 mb-1">
                            {message.customerEmail}
                          </p>

                          <h5
                            className={`text-sm mb-2 ${
                              message.status === "unread"
                                ? "font-medium text-gray-900"
                                : "text-gray-800"
                            }`}
                          >
                            {message.subject}
                          </h5>

                          <p className="text-sm text-gray-600 line-clamp-2">
                            {message.message}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 sm:ml-4">
                        <span className="text-xs text-gray-500">
                          {formatDate(message.createdAt)}
                        </span>

                        <div className="flex items-center gap-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Reply className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>
                                  Reply to {message.customerName}
                                </DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                  <h4 className="font-medium mb-2">
                                    Original Message:
                                  </h4>
                                  <p className="text-sm text-gray-700">
                                    {message.message}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <label className="text-sm font-medium">
                                    Your Reply:
                                  </label>
                                  <Textarea
                                    value={replyText}
                                    onChange={(e) =>
                                      setReplyText(e.target.value)
                                    }
                                    placeholder="Type your reply here..."
                                    rows={6}
                                  />
                                </div>

                                <div className="flex flex-wrap justify-end gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      setReplyText("");
                                      setSelectedMessage(null);
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    onClick={() => handleReply(message.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Send Reply
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(message.id);
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}