'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, CreditCard, Loader2 } from 'lucide-react'
import { SUBSCRIPTION_PLANS } from '@/lib/stripe'
import { getStripe } from '@/lib/stripe'
import { useUser } from '@/hooks/use-user'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export default function BillingPage() {
  const { user } = useUser()
  const [loading, setLoading] = useState<string | null>(null)
  const [profile, setProfile] = useState<{ stripe_customer_id?: string; subscription_status?: string; subscription_plan?: string } | null>(null)
  const supabase = createClient()

  const fetchProfile = useCallback(async () => {
    if (!user) return

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setProfile(data)
  }, [user, supabase])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleSubscribe = async (planType: string) => {
    if (!user) {
      toast.error('Please log in to subscribe')
      return
    }

    setLoading(planType)

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      })

      const { sessionId } = await response.json()

      if (!sessionId) {
        throw new Error('Failed to create checkout session')
      }

      const stripe = await getStripe()
      if (!stripe) {
        throw new Error('Stripe not loaded')
      }

      const { error } = await stripe.redirectToCheckout({ sessionId })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to start checkout process')
    } finally {
      setLoading(null)
    }
  }

  const handleManageSubscription = async () => {
    if (!user) {
      toast.error('Please log in to manage subscription')
      return
    }

    setLoading('portal')

    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
      })

      const { url } = await response.json()

      if (!url) {
        throw new Error('Failed to create portal session')
      }

      window.location.href = url
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to open customer portal')
    } finally {
      setLoading(null)
    }
  }

  const currentPlan = profile?.subscription_plan
  const subscriptionStatus = profile?.subscription_status

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing & Subscription</h1>
        <p className="text-muted-foreground">
          Manage your subscription and billing information
        </p>
      </div>

      {/* Current Subscription Status */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {currentPlan ? SUBSCRIPTION_PLANS[currentPlan as keyof typeof SUBSCRIPTION_PLANS]?.name : 'Free Plan'}
                </p>
                <p className="text-sm text-muted-foreground">
                  Status: <Badge variant={subscriptionStatus === 'active' ? 'default' : 'secondary'}>
                    {subscriptionStatus || 'inactive'}
                  </Badge>
                </p>
              </div>
              <div className="flex items-center gap-4">
                {currentPlan && subscriptionStatus === 'active' && (
                  <div className="text-right">
                    <p className="font-medium">
                      ${SUBSCRIPTION_PLANS[currentPlan as keyof typeof SUBSCRIPTION_PLANS]?.price}/month
                    </p>
                    <p className="text-sm text-muted-foreground">Billed monthly</p>
                  </div>
                )}
                {currentPlan && subscriptionStatus === 'active' && (
                  <Button
                    variant="outline"
                    onClick={handleManageSubscription}
                    disabled={loading === 'portal'}
                  >
                    {loading === 'portal' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Manage Subscription'
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscription Plans */}
      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => {
          const isCurrentPlan = currentPlan === key
          const isActive = subscriptionStatus === 'active'

          return (
            <Card key={key} className={isCurrentPlan && isActive ? 'border-primary' : ''}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{plan.name}</CardTitle>
                  {isCurrentPlan && isActive && (
                    <Badge variant="default">Current Plan</Badge>
                  )}
                </div>
                <CardDescription>
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/month</span>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button
                  className="w-full"
                  onClick={() => handleSubscribe(key)}
                  disabled={loading === key || (isCurrentPlan && isActive)}
                  variant={isCurrentPlan && isActive ? 'secondary' : 'default'}
                >
                  {loading === key ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : isCurrentPlan && isActive ? (
                    'Current Plan'
                  ) : (
                    `Subscribe to ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Free Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Free Plan</CardTitle>
            {!currentPlan && (
              <Badge variant="secondary">Current Plan</Badge>
            )}
          </div>
          <CardDescription>
            <span className="text-3xl font-bold">$0</span>
            <span className="text-muted-foreground">/month</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Up to 3 vendors</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Basic document storage</span>
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm">Email notifications</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
