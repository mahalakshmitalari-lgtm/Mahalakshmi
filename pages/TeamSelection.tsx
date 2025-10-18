
import React, { useState } from 'react';
import { Team } from '../types';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Label, Select } from '../components/ui';

interface TeamSelectionPageProps {
  onSubmit: (team: string) => void;
}

export const TeamSelectionPage: React.FC<TeamSelectionPageProps> = ({ onSubmit }) => {
  const [selectedTeam, setSelectedTeam] = useState<string>(Team.ONBOARDING);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeam) {
      onSubmit(selectedTeam);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Select Your Team</CardTitle>
          <CardDescription>Please select your team to continue to the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="team">Team Name</Label>
                <Select
                  id="team"
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                >
                  {Object.values(Team).map((teamName) => (
                    <option key={teamName} value={teamName}>{teamName}</option>
                  ))}
                </Select>
              </div>
            </div>
            <Button type="submit" className="w-full mt-6">Continue</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
