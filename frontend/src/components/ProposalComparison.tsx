import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Check, X } from "lucide-react";
import type { ProposalVersion } from "@shared/schema";
import { format } from "date-fns";

interface ProposalComparisonProps {
  proposals: ProposalVersion[];
  onSelect?: (proposalId: string) => void;
  onDelete?: (proposalId: string) => void;
}

export function ProposalComparison({
  proposals,
  onSelect,
  onDelete,
}: ProposalComparisonProps) {
  const [selectedProposals, setSelectedProposals] = useState<string[]>(
    proposals.slice(0, 2).map((p) => p.id)
  );

  const selected = proposals.filter((p) => selectedProposals.includes(p.id));
  const similarities = selected.length === 2 ? compareProposals(selected) : null;

  const toggleProposal = (id: string) => {
    setSelectedProposals((prev) => {
      if (prev.includes(id)) {
        return prev.filter((p) => p !== id);
      }
      if (prev.length < 2) {
        return [...prev, id];
      }
      return [prev[1], id];
    });
  };

  return (
    <div className="space-y-6">
      {/* Proposal List */}
      <Card>
        <CardHeader>
          <CardTitle>All Proposals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedProposals.includes(proposal.id)
                  ? "border-primary bg-primary/5"
                  : "border-muted hover:border-primary/50"
              }`}
              onClick={() => toggleProposal(proposal.id)}
              data-testid={`proposal-card-${proposal.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold">
                      v{proposal.versionNumber}
                      {proposal.title && ` - ${proposal.title}`}
                    </h3>
                    <Badge
                      variant={
                        proposal.status === "accepted"
                          ? "default"
                          : proposal.status === "rejected"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {proposal.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(proposal.checkIn), "MMM d")} -{" "}
                    {format(new Date(proposal.checkOut), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    ${Number(proposal.total).toFixed(2)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {proposal.guests} guest{proposal.guests !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              {proposal.notes && (
                <p className="text-sm text-muted-foreground italic mb-3">
                  "{proposal.notes}"
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Created {format(new Date(proposal.createdAt), "MMM d, yyyy h:mm a")}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Comparison View */}
      {selected.length === 2 && similarities && (
        <Card>
          <CardHeader>
            <CardTitle>Proposal Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-semibold py-3 px-4">Detail</th>
                    {selected.map((proposal) => (
                      <th
                        key={proposal.id}
                        className="text-center font-semibold py-3 px-4"
                      >
                        <div className="font-semibold">v{proposal.versionNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(proposal.checkIn), "MMM d")}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Check-in Date */}
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">Check-in</td>
                    {selected.map((proposal) => (
                      <td key={proposal.id} className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {similarities.checkInDiffers ? (
                            <X className="h-4 w-4 text-destructive" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                          {format(new Date(proposal.checkIn), "MMM d, yyyy")}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Check-out Date */}
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">Check-out</td>
                    {selected.map((proposal) => (
                      <td key={proposal.id} className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {similarities.checkOutDiffers ? (
                            <X className="h-4 w-4 text-destructive" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                          {format(new Date(proposal.checkOut), "MMM d, yyyy")}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Guests */}
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">Guests</td>
                    {selected.map((proposal) => (
                      <td key={proposal.id} className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {similarities.guestsDiffer ? (
                            <X className="h-4 w-4 text-destructive" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                          {proposal.guests}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Price per Night */}
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">Price/night</td>
                    {selected.map((proposal) => (
                      <td key={proposal.id} className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {similarities.pricePerNightDiffers ? (
                            <X className="h-4 w-4 text-destructive" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                          ${Number(proposal.pricePerNight).toFixed(2)}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Cleaning Fee */}
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">Cleaning Fee</td>
                    {selected.map((proposal) => (
                      <td key={proposal.id} className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {similarities.cleaningFeeDiffers ? (
                            <X className="h-4 w-4 text-destructive" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                          ${Number(proposal.cleaningFee).toFixed(2)}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Service Fee */}
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">Service Fee</td>
                    {selected.map((proposal) => (
                      <td key={proposal.id} className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {similarities.serviceFeeDiffers ? (
                            <X className="h-4 w-4 text-destructive" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                          ${Number(proposal.serviceFee).toFixed(2)}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Tax */}
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">Tax</td>
                    {selected.map((proposal) => (
                      <td key={proposal.id} className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {similarities.taxDiffers ? (
                            <X className="h-4 w-4 text-destructive" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                          ${Number(proposal.tax).toFixed(2)}
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Total */}
                  <tr className="bg-muted/50 hover:bg-muted/70">
                    <td className="py-3 px-4 font-bold">Total</td>
                    {selected.map((proposal) => (
                      <td key={proposal.id} className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {similarities.totalDiffers ? (
                            <X className="h-4 w-4 text-destructive" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                          <span className="text-lg font-bold">
                            ${Number(proposal.total).toFixed(2)}
                          </span>
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Savings Highlight */}
                  {similarities.totalDiffers && (
                    <tr className="bg-primary/10 border-t-2 border-primary">
                      <td className="py-3 px-4 font-bold">Difference</td>
                      {selected.map((proposal, idx) => (
                        <td key={proposal.id} className="py-3 px-4 text-center">
                          {idx === 1 ? (
                            <span
                              className={`font-bold text-lg ${
                                Number(proposal.total) < Number(selected[0].total)
                                  ? "text-green-600"
                                  : "text-destructive"
                              }`}
                            >
                              {Number(proposal.total) < Number(selected[0].total)
                                ? "-"
                                : "+"}
                              $
                              {Math.abs(
                                Number(proposal.total) - Number(selected[0].total)
                              ).toFixed(2)}
                            </span>
                          ) : null}
                        </td>
                      ))}
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {selected.length === 1 && onSelect && (
          <Button onClick={() => onSelect(selected[0].id)} className="flex-1">
            Select this proposal
          </Button>
        )}
        {selectedProposals.length > 0 && onDelete && (
          <Button
            variant="destructive"
            onClick={() => {
              selectedProposals.forEach((id) => onDelete(id));
              setSelectedProposals([]);
            }}
          >
            Delete selected
          </Button>
        )}
      </div>
    </div>
  );
}

// Helper function to compare two proposals
function compareProposals(proposals: ProposalVersion[]) {
  const [p1, p2] = proposals;
  return {
    checkInDiffers: p1.checkIn !== p2.checkIn,
    checkOutDiffers: p1.checkOut !== p2.checkOut,
    guestsDiffer: p1.guests !== p2.guests,
    pricePerNightDiffers:
      Number(p1.pricePerNight) !== Number(p2.pricePerNight),
    cleaningFeeDiffers:
      Number(p1.cleaningFee) !== Number(p2.cleaningFee),
    serviceFeeDiffers:
      Number(p1.serviceFee) !== Number(p2.serviceFee),
    taxDiffers: Number(p1.tax) !== Number(p2.tax),
    totalDiffers: Number(p1.total) !== Number(p2.total),
  };
}
